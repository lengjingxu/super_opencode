from __future__ import annotations

import json
import time
from datetime import datetime
from typing import Any

import lark_oapi as lark
from lark_oapi.api.im.v1 import P2ImMessageReceiveV1
from lark_oapi.event.callback.model.p2_card_action_trigger import (
    P2CardActionTrigger,
    P2CardActionTriggerResponse,
)
from lark_oapi.api.application.v6 import P2ApplicationBotMenuV6

from .config import FeishuConfig
from .feishu_client import FeishuClient
from .opencode_processor import OpenCodeProcessor
from .store import JsonStore, MemoryManager
from .cards import (
    help_card,
    session_list_card,
    todo_card,
    diff_card,
    health_card,
    error_card,
    make_card,
    thinking_card,
    streaming_card,
    completion_card,
    working_card,
    vcs_card,
)

_STREAM_INTERVAL = 3.0


class FeishuBot:
    def __init__(self, config: FeishuConfig):
        self.config = config
        self.feishu_client = FeishuClient(config)
        self.store = JsonStore()
        self.processor = OpenCodeProcessor(config, store=self.store)
        if self.processor.client:
            self.memory_manager = MemoryManager(self.store, self.processor.client)
        else:
            self.memory_manager = None
        self._handler = self._build_event_handler()

    def _build_event_handler(self) -> lark.EventDispatcherHandler:
        return (
            lark.EventDispatcherHandler.builder("", "")
            .register_p2_im_message_receive_v1(self._on_message_receive)
            .register_p2_card_action_trigger(self._on_card_action)
            .register_p2_application_bot_menu_v6(self._on_bot_menu)
            .build()
        )

    def _on_message_receive(self, data: P2ImMessageReceiveV1) -> None:
        try:
            event = data.event
            if event is None:
                return

            message = event.message
            sender = event.sender
            if message is None or sender is None:
                return

            message_id: str = message.message_id or ""
            chat_id: str = message.chat_id or ""
            msg_type: str = message.message_type or ""
            content_raw: str = message.content or ""
            sender_id: str = (
                sender.sender_id.open_id
                if sender.sender_id and sender.sender_id.open_id
                else "unknown"
            )
            sender_type: str = sender.sender_type or ""

            if msg_type != "text":
                return
            if sender_type == "app":
                return

            try:
                text = json.loads(content_raw).get("text", "")
            except (json.JSONDecodeError, TypeError):
                text = content_raw

            text = text.strip()
            if not text:
                return

            print(
                f"[{datetime.now().isoformat()}] Message from {sender_id}: {text[:100]}",
                flush=True,
            )

            if text.startswith("/"):
                self._handle_command(text, message_id, chat_id, sender_id)
            else:
                self._handle_conversation(text, message_id, chat_id, sender_id)

        except Exception as e:
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Handle message failed: {e}",
                flush=True,
            )

    # ── Card Action Callback ──────────────────────────────────────

    def _on_card_action(self, data: P2CardActionTrigger) -> P2CardActionTriggerResponse:
        open_id = ""
        try:
            event = data.event
            if not event or not event.operator or not event.action:
                return P2CardActionTriggerResponse({})

            open_id = event.operator.open_id or ""
            value: dict[str, Any] = event.action.value or {}
            action_name: str = value.get("action", "")
            session_id: str = value.get("session_id", "")

            print(
                f"[{datetime.now().isoformat()}] Card action: "
                f"{action_name} from {open_id}",
                flush=True,
            )

            handler = self._card_action_handlers().get(action_name)
            if handler:
                handler(open_id, session_id, value)

            return P2CardActionTriggerResponse({})
        except Exception as e:
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card action failed: {e}",
                flush=True,
            )
            if open_id:
                self.feishu_client.send_card_to_user(open_id, error_card(str(e)))
            return P2CardActionTriggerResponse({})

    def _card_action_handlers(self) -> dict[str, Any]:
        return {
            "switch_session": self._action_switch_session,
            "show_sessions": self._action_show_sessions,
            "new_session": self._action_new_session,
            "show_todos": self._action_show_todos,
            "refresh_todos": self._action_show_todos,
            "show_diff": self._action_show_diff,
            "refresh_diff": self._action_show_diff,
            "abort": self._action_abort,
            "health_check": self._action_health_check,
            "show_vcs": self._action_show_vcs,
        }

    def _action_switch_session(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        self.processor.set_user_session(open_id, session_id)
        short = session_id[-8:] if len(session_id) > 8 else session_id
        self.feishu_client.send_card_to_user(
            open_id,
            make_card("🔄 已切换会话", f"当前会话: `{short}`", color="blue"),
        )

    def _action_show_sessions(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        if not client:
            self.feishu_client.send_card_to_user(
                open_id, error_card("OpenCode Server 未连接")
            )
            return
        sessions = client.list_sessions()
        active_id = self.processor.user_sessions.get(open_id, "")
        self.feishu_client.send_card_to_user(
            open_id, session_list_card(sessions, active_id)
        )

    def _action_new_session(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        if not client:
            self.feishu_client.send_card_to_user(
                open_id, error_card("OpenCode Server 未连接")
            )
            return
        title = f"feishu-{open_id[:8]}"
        data = client.create_session(title=title)
        new_id = data.get("id", "")
        if new_id:
            self.processor.set_user_session(open_id, new_id)
            self.feishu_client.send_card_to_user(
                open_id,
                make_card(
                    "🆕 新会话已创建",
                    f"**标题**: {title}\n**ID**: `{new_id[-8:]}`\n\n发送消息开始对话",
                    color="blue",
                ),
            )
        else:
            self.feishu_client.send_card_to_user(open_id, error_card("创建会话失败"))

    def _action_show_todos(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        sid = session_id or self.processor.user_sessions.get(open_id, "")
        if not client or not sid:
            self.feishu_client.send_card_to_user(
                open_id, make_card("📋 任务清单", "无活跃会话")
            )
            return
        todos = client.get_todos(sid)
        sess = client.get_session(sid)
        title = sess.get("title", "")
        self.feishu_client.send_card_to_user(
            open_id, todo_card(todos, title, session_id=sid)
        )

    def _action_show_diff(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        sid = session_id or self.processor.user_sessions.get(open_id, "")
        if not client or not sid:
            self.feishu_client.send_card_to_user(
                open_id, make_card("📝 代码变更", "无活跃会话")
            )
            return
        diffs = client.get_diff(sid)
        self.feishu_client.send_card_to_user(open_id, diff_card(diffs, session_id=sid))

    def _action_abort(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        sid = session_id or self.processor.user_sessions.get(open_id, "")
        if not client or not sid:
            self.feishu_client.send_card_to_user(
                open_id, make_card("💤 无任务", "当前没有运行中的任务")
            )
            return
        client.abort_session(sid)
        self.feishu_client.send_card_to_user(
            open_id, make_card("⏹ 已终止", "当前任务已终止", color="red")
        )

    def _action_health_check(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        if not client:
            self.feishu_client.send_card_to_user(open_id, health_card(False))
            return
        healthy = client.health_check()
        project = None
        if healthy:
            try:
                project = client.get_project()
            except Exception:
                pass
        self.feishu_client.send_card_to_user(open_id, health_card(healthy, project))

    def _action_show_vcs(
        self, open_id: str, session_id: str, value: dict[str, Any]
    ) -> None:
        client = self.processor.client
        if not client:
            self.feishu_client.send_card_to_user(
                open_id, error_card("OpenCode Server 未连接")
            )
            return
        project = None
        try:
            project = client.get_project()
        except Exception:
            pass
        diffs = None
        sid = session_id or self.processor.user_sessions.get(open_id, "")
        if sid:
            try:
                diffs = client.get_diff(sid)
            except Exception:
                pass
        self.feishu_client.send_card_to_user(
            open_id, vcs_card(project=project, diffs=diffs, session_id=sid)
        )

    # ── Bot Menu Handler ──────────────────────────────────────────

    def _on_bot_menu(self, data: P2ApplicationBotMenuV6) -> None:
        try:
            event = data.event
            if not event or not event.operator or not event.operator.operator_id:
                return
            open_id: str = event.operator.operator_id.open_id or ""
            event_key: str = event.event_key or ""
            if not open_id or not event_key:
                return

            print(
                f"[{datetime.now().isoformat()}] Bot menu: {event_key} from {open_id}",
                flush=True,
            )

            menu_map = {
                "show_sessions": lambda: session_list_card(
                    self.processor.client.list_sessions()
                    if self.processor.client
                    else [],
                    self.processor.user_sessions.get(open_id, ""),
                ),
                "new_session": lambda: self._menu_new_session(open_id),
                "show_todos": lambda: self._menu_show_todos(open_id),
                "show_diff": lambda: self._menu_show_diff(open_id),
                "health_check": lambda: health_card(
                    self.processor.client.health_check()
                    if self.processor.client
                    else False
                ),
                "show_help": lambda: help_card(),
                "show_vcs": lambda: self._menu_show_vcs(open_id),
            }

            builder = menu_map.get(event_key)
            if builder:
                card = builder()
                self.feishu_client.send_card_to_user(open_id, card)
        except Exception as e:
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Bot menu failed: {e}",
                flush=True,
            )

    def _menu_new_session(self, open_id: str) -> dict[str, Any]:
        client = self.processor.client
        if not client:
            return error_card("OpenCode Server 未连接")
        title = f"feishu-{open_id[:8]}"
        data = client.create_session(title=title)
        new_id = data.get("id", "")
        if new_id:
            self.processor.set_user_session(open_id, new_id)
            return make_card(
                "🆕 新会话已创建",
                f"**标题**: {title}\n**ID**: `{new_id[-8:]}`\n\n发送消息开始对话",
                color="blue",
            )
        return error_card("创建会话失败")

    def _menu_show_todos(self, open_id: str) -> dict[str, Any]:
        client = self.processor.client
        sid = self.processor.user_sessions.get(open_id, "")
        if not client or not sid:
            return make_card("📋 任务清单", "请先发送消息创建会话")
        todos = client.get_todos(sid)
        sess = client.get_session(sid)
        return todo_card(todos, sess.get("title", ""), session_id=sid)

    def _menu_show_diff(self, open_id: str) -> dict[str, Any]:
        client = self.processor.client
        sid = self.processor.user_sessions.get(open_id, "")
        if not client or not sid:
            return make_card("📝 代码变更", "请先发送消息创建会话")
        diffs = client.get_diff(sid)
        return diff_card(diffs, session_id=sid)

    def _menu_show_vcs(self, open_id: str) -> dict[str, Any]:
        client = self.processor.client
        if not client:
            return error_card("OpenCode Server 未连接")
        project = None
        try:
            project = client.get_project()
        except Exception:
            pass
        diffs = None
        sid = self.processor.user_sessions.get(open_id, "")
        if sid:
            try:
                diffs = client.get_diff(sid)
            except Exception:
                pass
        return vcs_card(project=project, diffs=diffs, session_id=sid)

    # ── Command Handlers ──────────────────────────────────────────

    def _handle_command(
        self, text: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        parts = text.split(None, 1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""

        handlers = {
            "/h": self._cmd_help,
            "/help": self._cmd_help,
            "/health": self._cmd_health,
            "/x": self._cmd_abort,
            "/abort": self._cmd_abort,
            "/s": self._cmd_session,
            "/session": self._cmd_session,
            "/d": self._cmd_diff,
            "/diff": self._cmd_diff,
            "/t": self._cmd_todo,
            "/todo": self._cmd_todo,
            "/v": self._cmd_vcs,
            "/vcs": self._cmd_vcs,
        }

        handler = handlers.get(cmd)
        if handler:
            try:
                handler(args, message_id, chat_id, sender_id)
            except Exception as e:
                self._reply_card(message_id, chat_id, error_card(str(e)))
        else:
            self.feishu_client.reply_text(
                message_id, f"未知命令: {cmd}\n输入 /h 查看帮助"
            )

    def _cmd_help(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        self._reply_card(message_id, chat_id, help_card())

    def _cmd_health(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        if not client:
            self._reply_card(message_id, chat_id, health_card(False))
            return

        healthy = client.health_check()
        project = None
        if healthy:
            try:
                project = client.get_project()
            except Exception:
                pass
        self._reply_card(message_id, chat_id, health_card(healthy, project))

    def _cmd_abort(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        sessions = self.processor.user_sessions

        if not client or sender_id not in sessions:
            self.feishu_client.reply_text(message_id, "💤 当前没有运行中的任务")
            return

        session_id = sessions[sender_id]
        try:
            client.abort_session(session_id)
            self.feishu_client.reply_text(message_id, "⏹ 已终止当前任务")
        except Exception as e:
            self.feishu_client.reply_text(message_id, f"终止失败: {e}")

    def _cmd_session(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        sub_parts = args.split(None, 1)
        sub_cmd = sub_parts[0].lower() if sub_parts else "list"
        sub_args = sub_parts[1] if len(sub_parts) > 1 else ""

        if sub_cmd in ("list", "ls", ""):
            self._session_list(message_id, chat_id, sender_id)
        elif sub_cmd == "new":
            self._session_new(sub_args, message_id, chat_id, sender_id)
        elif sub_cmd == "switch":
            self._session_switch(sub_args, message_id, chat_id, sender_id)
        else:
            self.feishu_client.reply_text(
                message_id, f"未知子命令: /s {sub_cmd}\n可用: list, new, switch"
            )

    def _session_list(self, message_id: str, chat_id: str, sender_id: str) -> None:
        client = self.processor.client
        if not client:
            self._reply_card(message_id, chat_id, error_card("OpenCode Server 未连接"))
            return

        sessions = client.list_sessions()
        active_id = self.processor.user_sessions.get(sender_id, "")
        self._reply_card(message_id, chat_id, session_list_card(sessions, active_id))

    def _session_new(
        self, title: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        if not client:
            self._reply_card(message_id, chat_id, error_card("OpenCode Server 未连接"))
            return

        title = title.strip() or f"feishu-{sender_id[:8]}"
        session_data = client.create_session(title=title)
        session_id = session_data.get("id", "")
        if session_id:
            self.processor.set_user_session(sender_id, session_id)
            self._reply_card(
                message_id,
                chat_id,
                make_card(
                    "🆕 新会话已创建",
                    f"**标题**: {title}\n**ID**: `{session_id[-8:]}`\n\n发送消息开始对话",
                    color="blue",
                ),
            )
        else:
            self._reply_card(message_id, chat_id, error_card("创建会话失败"))

    def _session_switch(
        self, session_id_input: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        if not client:
            self._reply_card(message_id, chat_id, error_card("OpenCode Server 未连接"))
            return

        session_id_input = session_id_input.strip()
        if not session_id_input:
            self.feishu_client.reply_text(message_id, "用法: /s switch <会话ID>")
            return

        all_sessions = client.list_sessions()
        matched = None
        for s in all_sessions:
            sid = s.get("id", "")
            if sid == session_id_input or sid.endswith(session_id_input):
                matched = s
                break

        if not matched:
            self.feishu_client.reply_text(message_id, f"找不到会话: {session_id_input}")
            return

        full_id = matched.get("id", "")
        title = matched.get("title", "未命名")
        self.processor.set_user_session(sender_id, full_id)
        self._reply_card(
            message_id,
            chat_id,
            make_card(
                "🔄 已切换会话",
                f"**标题**: {title}\n**ID**: `{full_id[-8:]}`",
                color="blue",
            ),
        )

    def _cmd_diff(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        sessions = self.processor.user_sessions

        if not client or sender_id not in sessions:
            self.feishu_client.reply_text(message_id, "请先发送消息创建会话")
            return

        session_id = sessions[sender_id]
        try:
            diffs = client.get_diff(session_id)
            self._reply_card(message_id, chat_id, diff_card(diffs))
        except Exception as e:
            self._reply_card(message_id, chat_id, error_card(f"获取 Diff 失败: {e}"))

    def _cmd_todo(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        sessions = self.processor.user_sessions

        if not client or sender_id not in sessions:
            self.feishu_client.reply_text(message_id, "请先发送消息创建会话")
            return

        session_id = sessions[sender_id]
        try:
            todos = client.get_todos(session_id)
            session_data = client.get_session(session_id)
            title = session_data.get("title", "")
            self._reply_card(message_id, chat_id, todo_card(todos, title))
        except Exception as e:
            self._reply_card(message_id, chat_id, error_card(f"获取任务清单失败: {e}"))

    def _cmd_vcs(
        self, args: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        client = self.processor.client
        if not client:
            self._reply_card(message_id, chat_id, error_card("OpenCode Server 未连接"))
            return

        project = None
        try:
            project = client.get_project()
        except Exception:
            pass

        diffs = None
        sessions = self.processor.user_sessions
        sid = sessions.get(sender_id, "")
        if sid:
            try:
                diffs = client.get_diff(sid)
            except Exception:
                pass

        self._reply_card(
            message_id,
            chat_id,
            vcs_card(project=project, diffs=diffs, session_id=sid),
        )

    def _handle_conversation(
        self, text: str, message_id: str, chat_id: str, sender_id: str
    ) -> None:
        session_id = self.processor.user_sessions.get(sender_id, "")
        card_msg_id = self.feishu_client.send_card_return_id(
            chat_id, thinking_card(session_id)
        )

        progress_cb = self._make_progress_callback(card_msg_id, session_id)
        reply_cb = self._make_reply_callback(card_msg_id, chat_id, session_id)
        error_cb = self._make_error_callback(card_msg_id, chat_id)

        self.processor.process_message_async(
            message_id=message_id,
            sender=sender_id,
            text=text,
            reply_callback=reply_cb,
            progress_callback=progress_cb,
            error_callback=error_cb,
        )

    def _make_progress_callback(self, card_msg_id: str | None, session_id: str):
        last_update = [0.0]

        def _on_progress(_sid: str, partial_text: str) -> None:
            if not card_msg_id:
                return
            now = time.time()
            if now - last_update[0] < _STREAM_INTERVAL:
                return
            last_update[0] = now

            todos = None
            client = self.processor.client
            if client and session_id:
                try:
                    todos = client.get_todos(session_id)
                except Exception:
                    pass

            if todos:
                card = working_card(
                    todos=todos,
                    partial_text=partial_text,
                    session_id=session_id,
                )
            else:
                card = streaming_card(partial_text, session_id)

            self.feishu_client.update_card(card_msg_id, card)

        return _on_progress

    def _make_reply_callback(
        self, card_msg_id: str | None, chat_id: str, session_id: str
    ):
        def _on_reply(_message_id: str, text: str) -> bool:
            todos = None
            diffs = None
            client = self.processor.client
            if client and session_id:
                try:
                    todos = client.get_todos(session_id)
                except Exception:
                    pass
                try:
                    diffs = client.get_diff(session_id)
                except Exception:
                    pass
            card = completion_card(
                text, session_id=session_id, todos=todos, diffs=diffs
            )
            if card_msg_id:
                return self.feishu_client.update_card(card_msg_id, card)
            return self.feishu_client.send_card(chat_id, card)

        return _on_reply

    def _make_error_callback(self, card_msg_id: str | None, chat_id: str):
        def _on_error(_message_id: str, err_text: str) -> None:
            card = error_card(err_text)
            if card_msg_id:
                self.feishu_client.update_card(card_msg_id, card)
            else:
                self.feishu_client.send_card(chat_id, card)

        return _on_error

    def _reply_card(self, message_id: str, chat_id: str, card: dict[str, Any]) -> None:
        if not self.feishu_client.reply_card(message_id, card):
            self.feishu_client.send_card(chat_id, card)

    def start(self) -> None:
        log_level_map = {
            "DEBUG": lark.LogLevel.DEBUG,
            "INFO": lark.LogLevel.INFO,
            "WARN": lark.LogLevel.WARNING,
            "WARNING": lark.LogLevel.WARNING,
            "ERROR": lark.LogLevel.ERROR,
        }
        log_level = log_level_map.get(self.config.log_level.upper(), lark.LogLevel.INFO)

        print(f"Starting Feishu Bot (WebSocket long connection)", flush=True)
        print(f"App ID: {self.config.app_id[:8]}...", flush=True)
        if self.config.use_server_mode:
            print(
                f"OpenCode Server: {self.config.server_base_url}",
                flush=True,
            )
        else:
            print(f"OpenCode CLI: {self.config.opencode_path}", flush=True)
        if self.config.working_dir:
            print(f"Working Dir: {self.config.working_dir}", flush=True)
        print(f"Model: {self.config.model}", flush=True)
        print("-" * 50, flush=True)

        if self.memory_manager:
            self.memory_manager.start()

        self.processor.start_event_listener()

        ws_client = lark.ws.Client(
            app_id=self.config.app_id,
            app_secret=self.config.app_secret,
            event_handler=self._handler,
            log_level=log_level,
        )
        ws_client.start()
