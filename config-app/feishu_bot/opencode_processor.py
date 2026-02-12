from __future__ import annotations

import os
import re
import shutil
import subprocess
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, Callable, Dict

from .config import FeishuConfig
from .opencode_client import OpenCodeClient
from .store import JsonStore, CHINESE_STOPWORDS, ENGLISH_STOPWORDS

_POLL_INTERVAL = 3.0
_POLL_TIMEOUT = 1800.0

_OPENCODE_SEARCH_PATHS = [
    Path.home() / ".opencode" / "bin" / "opencode",
    Path("/usr/local/bin/opencode"),
    Path("/opt/homebrew/bin/opencode"),
]


def _resolve_opencode_path(configured: str) -> str:
    found = shutil.which(configured)
    if found:
        return found
    for candidate in _OPENCODE_SEARCH_PATHS:
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return configured


class _PendingPrompt:
    __slots__ = (
        "session_id",
        "message_id",
        "reply_callback",
        "progress_callback",
        "error_callback",
        "created_at",
    )

    def __init__(
        self,
        session_id: str,
        message_id: str,
        reply_callback: Callable[[str, str], bool],
        progress_callback: Optional[Callable[[str, str], None]],
        error_callback: Optional[Callable[[str, str], None]],
    ):
        self.session_id = session_id
        self.message_id = message_id
        self.reply_callback = reply_callback
        self.progress_callback = progress_callback
        self.error_callback = error_callback
        self.created_at = time.time()


class OpenCodeProcessor:
    def __init__(self, config: FeishuConfig, store: JsonStore | None = None):
        self.config = config
        self._store = store
        self._user_sessions: Dict[str, str] = {}
        self._client: Optional[OpenCodeClient] = None
        self._pending: Dict[str, _PendingPrompt] = {}
        self._pending_lock = threading.Lock()
        self._sse_thread: Optional[threading.Thread] = None

        if config.use_server_mode:
            self._client = OpenCodeClient(
                host=config.opencode_server_host,
                port=config.opencode_server_port,
                password=config.opencode_server_password,
            )

        if self._store:
            self._user_sessions = self._store.get_all_user_sessions()

    def start_event_listener(self) -> None:
        if not self._client:
            return
        self._sse_thread = self._client.subscribe_events(
            on_event=self._on_sse_event,
            on_error=self._on_sse_error,
        )
        print(
            f"[{datetime.now().isoformat()}] SSE event listener started",
            flush=True,
        )

    def _on_sse_event(self, event: dict[str, Any]) -> None:
        payload = event.get("payload", {})
        event_type = payload.get("type", "")
        props = payload.get("properties", {})

        # 跳过心跳和连接事件
        if event_type in ("server.connected", "server.heartbeat", ""):
            return

        # 从多种可能的位置提取 sessionID
        session_id = (
            props.get("sessionID", "")
            or props.get("session_id", "")
            or props.get("info", {}).get("sessionID", "")
        )
        if not session_id:
            return

        with self._pending_lock:
            pending = self._pending.get(session_id)
        if not pending:
            return

        # session.idle = AI 处理完毕的最终信号
        if event_type == "session.idle":
            print(
                f"[{datetime.now().isoformat()}] [SSE] "
                f"session.idle for {session_id[:8]}",
                flush=True,
            )
            self._handle_prompt_completed(pending)
        elif event_type in (
            "session.updated",
            "message.updated",
            "message.part.updated",
        ):
            if pending.progress_callback:
                partial = ""
                try:
                    partial = self._extract_last_assistant_message(session_id)
                except Exception:
                    pass
                pending.progress_callback(session_id, partial)

    def _on_sse_error(self, exc: Exception) -> None:
        print(
            f"[{datetime.now().isoformat()}] SSE connection error: {exc}",
            flush=True,
        )

    def _handle_prompt_completed(self, pending: _PendingPrompt) -> None:
        sid = pending.session_id
        with self._pending_lock:
            self._pending.pop(sid, None)
        try:
            text = self._extract_last_assistant_message(sid)
            print(
                f"[{datetime.now().isoformat()}] [COMPLETE] "
                f"session={sid[:8]} text_len={len(text)} text_preview={text[:80]!r}",
                flush=True,
            )
            if text:
                pending.reply_callback(pending.message_id, text)
            elif pending.error_callback:
                pending.error_callback(
                    pending.message_id, "AI 未返回任何内容，请稍后重试"
                )
        except Exception as e:
            if pending.error_callback:
                pending.error_callback(pending.message_id, f"处理失败: {e}")

    def process_message_async(
        self,
        message_id: str,
        sender: str,
        text: str,
        reply_callback: Callable[[str, str], bool],
        progress_callback: Optional[Callable[[str, str], None]] = None,
        error_callback: Optional[Callable[[str, str], None]] = None,
    ) -> None:
        prompt = self._build_prompt(sender, text)

        thread = threading.Thread(
            target=self._process_and_reply,
            args=(
                message_id,
                sender,
                prompt,
                reply_callback,
                progress_callback,
                error_callback,
            ),
            daemon=True,
        )
        thread.start()

    def _poll_timeout(self, session_id: str) -> None:
        time.sleep(_POLL_TIMEOUT)
        with self._pending_lock:
            pending = self._pending.pop(session_id, None)
        if pending and pending.error_callback:
            pending.error_callback(pending.message_id, "处理超时，请重试")

    def _poll_session_status(self, session_id: str) -> None:
        """轮询兜底：防止 SSE 丢事件导致回调永远不触发。

        使用 /session/status 端点检查会话是否仍在 busy 状态。
        当 session_id 不再出现在 busy 列表中，说明 AI 处理完毕。
        """
        # 等一小段时间让 prompt_async 生效，session 进入 busy
        time.sleep(_POLL_INTERVAL * 2)
        while True:
            time.sleep(_POLL_INTERVAL)
            with self._pending_lock:
                pending = self._pending.get(session_id)
            if not pending:
                return
            try:
                assert self._client is not None
                all_status = self._client.get_all_session_status()
                session_info = all_status.get(session_id, {})
                is_busy = session_info.get("type") == "busy"

                if not is_busy:
                    with self._pending_lock:
                        still_pending = self._pending.get(session_id)
                    if still_pending:
                        print(
                            f"[{datetime.now().isoformat()}] [POLL] "
                            f"Session {session_id[:8]} no longer busy, "
                            f"completing via poll fallback",
                            flush=True,
                        )
                        self._handle_prompt_completed(still_pending)
                    return
            except Exception as exc:
                print(
                    f"[{datetime.now().isoformat()}] [POLL] "
                    f"Error polling session {session_id[:8]}: {exc}",
                    flush=True,
                )

    def _process_and_reply(
        self,
        message_id: str,
        sender: str,
        prompt: str,
        reply_callback: Callable[[str, str], bool],
        progress_callback: Optional[Callable[[str, str], None]] = None,
        error_callback: Optional[Callable[[str, str], None]] = None,
    ) -> None:
        try:
            # ── 异步路径：Server 可用时使用 prompt_async + SSE ──
            if self._client and self._is_server_available():
                session_id = self._get_or_create_session(sender)
                print(
                    f"[{datetime.now().isoformat()}] [ASYNC] "
                    f"Sending prompt_async to session {session_id[:8]}...",
                    flush=True,
                )

                # 注册 pending，SSE 事件处理器会消费它
                pending = _PendingPrompt(
                    session_id=session_id,
                    message_id=message_id,
                    reply_callback=reply_callback,
                    progress_callback=progress_callback,
                    error_callback=error_callback,
                )
                with self._pending_lock:
                    self._pending[session_id] = pending

                # 发送异步 prompt（立即返回，不阻塞）
                try:
                    self._client.prompt_async(session_id, prompt)
                except Exception as exc:
                    # prompt_async 失败时清理 pending 并报错
                    with self._pending_lock:
                        self._pending.pop(session_id, None)
                    raise exc

                # 启动超时看门狗线程
                threading.Thread(
                    target=self._poll_timeout,
                    args=(session_id,),
                    daemon=True,
                ).start()

                # 启动轮询兜底线程（防止 SSE 丢事件）
                threading.Thread(
                    target=self._poll_session_status,
                    args=(session_id,),
                    daemon=True,
                ).start()

                # 异步路径到此结束，后续由 SSE / 轮询兜底完成回调
                return

            # ── 同步回退路径：CLI ──
            if self._client:
                print(
                    f"[{datetime.now().isoformat()}] [SYNC] "
                    f"Server unavailable, falling back to CLI",
                    flush=True,
                )
            result = self._run_opencode_cli(prompt)

            if result:
                reply_callback(message_id, result)
                print(
                    f"[{datetime.now().isoformat()}] [SYNC] Reply sent",
                    flush=True,
                )
            else:
                print(
                    f"[{datetime.now().isoformat()}] [SYNC] No response generated",
                    flush=True,
                )
                if error_callback:
                    error_callback(message_id, "AI 未返回任何内容，请稍后重试")

        except Exception as e:
            print(f"[{datetime.now().isoformat()}] Error: {e}", flush=True)
            if error_callback:
                error_callback(message_id, f"处理失败: {e}")

    def _is_server_available(self) -> bool:
        if not self._client:
            return False
        return self._client.health_check()

    def _get_or_create_session(self, sender: str) -> str:
        if sender in self._user_sessions:
            return self._user_sessions[sender]

        assert self._client is not None
        session_data = self._client.create_session(title=f"feishu-{sender[:8]}")
        session_id = session_data.get("id", "")
        if not session_id:
            raise ValueError(f"Failed to create session: {session_data}")

        self._user_sessions[sender] = session_id
        if self._store:
            self._store.set_user_session(sender, session_id)
        print(
            f"[{datetime.now().isoformat()}] Created session {session_id} for {sender}",
            flush=True,
        )
        return session_id

    @staticmethod
    def _extract_text_from_response(data: dict[str, Any]) -> str:
        parts = data.get("parts", [])
        if not isinstance(parts, list):
            return ""
        for part in parts:
            if isinstance(part, dict) and part.get("type") == "text":
                text = part.get("text", "")
                if isinstance(text, str) and text.strip():
                    return text.strip()
        return ""

    def _extract_last_assistant_message(self, session_id: str) -> str:
        assert self._client is not None
        messages_data = self._client.get_session_messages(session_id)

        messages = messages_data if isinstance(messages_data, list) else []
        for msg in reversed(messages):
            if not isinstance(msg, dict):
                continue
            # API 返回 {info: {role, ...}, parts: [...]}
            info = msg.get("info", {})
            role = info.get("role", "") or msg.get("role", "")
            if role != "assistant":
                continue
            parts = msg.get("parts", [])
            for part in parts:
                if isinstance(part, dict) and part.get("type") == "text":
                    text = part.get("text", "")
                    if text.strip():
                        return text.strip()
        return ""

    @property
    def client(self) -> Optional[OpenCodeClient]:
        return self._client

    @property
    def user_sessions(self) -> Dict[str, str]:
        return self._user_sessions

    def get_or_create_session(self, sender: str) -> str:
        return self._get_or_create_session(sender)

    def set_user_session(self, sender: str, session_id: str) -> None:
        self._user_sessions[sender] = session_id
        if self._store:
            self._store.set_user_session(sender, session_id)

    def is_server_available(self) -> bool:
        return self._is_server_available()

    def _build_prompt(self, sender: str, text: str) -> str:
        if not self._store:
            return text

        keywords = re.findall(r"[\u4e00-\u9fff]|[a-zA-Z]{3,}", text.lower())

        filtered_keywords = [
            kw
            for kw in keywords
            if kw not in CHINESE_STOPWORDS and kw not in ENGLISH_STOPWORDS
        ]

        if not filtered_keywords:
            return text

        relevant_summaries = self._store.search_by_keywords(
            filtered_keywords, user_id=sender
        )

        if not relevant_summaries:
            return text

        memory_parts = []
        for s in relevant_summaries:
            title = s.get("title", "Untitled")
            summary = s.get("summary", "")
            memory_parts.append(f"### {title}\n{summary}")

        memory_context = "\n\n".join(memory_parts)
        prompt = (
            f"[Memory Context from previous conversations]\n"
            f"{memory_context}\n"
            f"[End of Memory Context]\n\n"
            f"User Message: {text}"
        )

        print(
            f"[{datetime.now().isoformat()}] Injected {len(relevant_summaries)} memories into prompt",
            flush=True,
        )
        return prompt

    def _run_opencode_cli(self, prompt: str) -> str:
        opencode_bin = _resolve_opencode_path(self.config.opencode_path)
        cmd = [
            opencode_bin,
            "run",
            "--model",
            self.config.model,
            prompt,
        ]

        kwargs: dict[str, Any] = {
            "capture_output": True,
            "text": True,
            "timeout": 1800,
        }

        if self.config.working_dir:
            kwargs["cwd"] = self.config.working_dir

        result = subprocess.run(cmd, **kwargs)

        if result.returncode != 0:
            raise Exception(f"OpenCode failed: {result.stderr}")

        return result.stdout.strip()
