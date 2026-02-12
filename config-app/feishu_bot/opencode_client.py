from __future__ import annotations

import json
import threading
from typing import Any, Callable, Optional

import requests
from requests.auth import HTTPBasicAuth


class OpenCodeClient:
    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = 4096,
        password: Optional[str] = None,
    ):
        self.base_url = f"http://{host}:{port}"
        self._auth = HTTPBasicAuth("opencode", password) if password else None
        self._session = requests.Session()
        if self._auth:
            self._session.auth = self._auth

    def health_check(self) -> bool:
        try:
            resp = self._session.get(f"{self.base_url}/global/health", timeout=5)
            return resp.status_code == 200
        except requests.RequestException:
            return False

    def create_session(self, title: Optional[str] = None) -> dict[str, Any]:
        body = {}
        if title:
            body["title"] = title

        resp = self._session.post(
            f"{self.base_url}/session",
            json=body,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def send_message(
        self,
        session_id: str,
        text: str,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "parts": [{"type": "text", "text": text}],
        }

        resp = self._session.post(
            f"{self.base_url}/session/{session_id}/message",
            json=body,
            timeout=1800,
        )
        resp.raise_for_status()
        return resp.json()

    def list_sessions(self) -> list[dict[str, Any]]:
        resp = self._session.get(f"{self.base_url}/session", timeout=10)
        resp.raise_for_status()
        sessions = resp.json()
        return [
            s
            for s in sessions
            if not s.get("parentID")
            and isinstance(s.get("title", ""), str)
            and s.get("title", "").startswith("feishu-")
        ]

    def get_session(self, session_id: str) -> dict[str, Any]:
        resp = self._session.get(f"{self.base_url}/session/{session_id}", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_session_status(self) -> dict[str, Any]:
        resp = self._session.get(f"{self.base_url}/session/status", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def abort_session(self, session_id: str) -> bool:
        resp = self._session.post(
            f"{self.base_url}/session/{session_id}/abort", timeout=10
        )
        resp.raise_for_status()
        return resp.status_code == 200

    def get_diff(
        self, session_id: str, message_id: str | None = None
    ) -> list[dict[str, Any]]:
        params: dict[str, str] = {}
        if message_id:
            params["messageID"] = message_id
        resp = self._session.get(
            f"{self.base_url}/session/{session_id}/diff",
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def get_todos(self, session_id: str) -> list[dict[str, Any]]:
        resp = self._session.get(
            f"{self.base_url}/session/{session_id}/todo", timeout=10
        )
        resp.raise_for_status()
        return resp.json()

    def get_session_messages(self, session_id: str, limit: int = 10) -> Any:
        resp = self._session.get(
            f"{self.base_url}/session/{session_id}/message",
            params={"limit": limit},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def get_project(self) -> dict[str, Any]:
        resp = self._session.get(f"{self.base_url}/project/current", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def summarize_session(
        self,
        session_id: str,
        provider_id: str = "anthropic",
        model_id: str = "claude-sonnet-4-20250514",
        auto: bool = True,
    ) -> bool:
        """POST /session/{id}/summarize — AI compaction summary."""
        resp = self._session.post(
            f"{self.base_url}/session/{session_id}/summarize",
            json={
                "providerID": provider_id,
                "modelID": model_id,
                "auto": auto,
            },
            timeout=300,
        )
        resp.raise_for_status()
        return resp.json()

    def prompt_async(
        self,
        session_id: str,
        text: str,
    ) -> bool:
        """POST /session/{id}/prompt_async — fire-and-forget prompt."""
        resp = self._session.post(
            f"{self.base_url}/session/{session_id}/prompt_async",
            json={"parts": [{"type": "text", "text": text}]},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.status_code == 204

    def subscribe_events(
        self,
        on_event: Callable[[dict[str, Any]], None],
        on_error: Callable[[Exception], None] | None = None,
    ) -> threading.Thread:
        """GET /global/event — SSE long-lived connection.

        Returns the daemon thread so the caller can track it.
        Events are dicts like ``{"directory": "...", "payload": {"type": "...", "properties": {...}}}``.
        """

        def _listen() -> None:
            try:
                resp = self._session.get(
                    f"{self.base_url}/global/event",
                    stream=True,
                    timeout=None,
                )
                resp.raise_for_status()
                for line in resp.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    if line.startswith("data:"):
                        raw = line[len("data:") :].strip()
                        if not raw:
                            continue
                        try:
                            event = json.loads(raw)
                            on_event(event)
                        except json.JSONDecodeError:
                            pass
            except Exception as exc:
                if on_error:
                    on_error(exc)

        t = threading.Thread(target=_listen, daemon=True)
        t.start()
        return t

    def get_all_session_status(self) -> dict[str, Any]:
        """GET /session/status — status of all sessions."""
        resp = self._session.get(f"{self.base_url}/session/status", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def close(self) -> None:
        self._session.close()
