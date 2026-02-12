from __future__ import annotations

import json
from datetime import datetime

from typing import Any

import lark_oapi as lark
from lark_oapi.api.im.v1 import (
    CreateMessageRequest,
    CreateMessageRequestBody,
    PatchMessageRequest,
    PatchMessageRequestBody,
    ReplyMessageRequest,
    ReplyMessageRequestBody,
)

from .config import FeishuConfig


class FeishuClient:
    def __init__(self, config: FeishuConfig):
        self.config = config
        self.client = (
            lark.Client.builder()
            .app_id(config.app_id)
            .app_secret(config.app_secret)
            .log_level(
                lark.LogLevel.DEBUG
                if config.log_level == "DEBUG"
                else lark.LogLevel.INFO
            )
            .build()
        )

    @property
    def _message(self):  # pyright: ignore[reportReturnType]
        return self.client.im.v1.message  # pyright: ignore[reportOptionalMemberAccess]

    def reply_text(self, message_id: str, text: str) -> bool:
        request = (
            ReplyMessageRequest.builder()
            .message_id(message_id)
            .request_body(
                ReplyMessageRequestBody.builder()
                .msg_type("text")
                .content(json.dumps({"text": text}))
                .build()
            )
            .build()
        )

        response = self._message.reply(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Reply failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False

        print(
            f"[{datetime.now().isoformat()}] Reply sent to message {message_id}",
            flush=True,
        )
        return True

    def send_text(self, chat_id: str, text: str) -> bool:
        request = (
            CreateMessageRequest.builder()
            .receive_id_type("chat_id")
            .request_body(
                CreateMessageRequestBody.builder()
                .receive_id(chat_id)
                .msg_type("text")
                .content(json.dumps({"text": text}))
                .build()
            )
            .build()
        )

        response = self._message.create(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Send failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False

        print(
            f"[{datetime.now().isoformat()}] Message sent to chat {chat_id}",
            flush=True,
        )
        return True

    def send_card_to_user(self, open_id: str, card: dict[str, Any]) -> bool:
        request = (
            CreateMessageRequest.builder()
            .receive_id_type("open_id")
            .request_body(
                CreateMessageRequestBody.builder()
                .receive_id(open_id)
                .msg_type("interactive")
                .content(json.dumps(card))
                .build()
            )
            .build()
        )

        response = self._message.create(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card send to user failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False
        return True

    def send_card(self, chat_id: str, card: dict[str, Any]) -> bool:
        request = (
            CreateMessageRequest.builder()
            .receive_id_type("chat_id")
            .request_body(
                CreateMessageRequestBody.builder()
                .receive_id(chat_id)
                .msg_type("interactive")
                .content(json.dumps(card))
                .build()
            )
            .build()
        )

        response = self._message.create(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card send failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False
        return True

    def send_card_return_id(self, chat_id: str, card: dict[str, Any]) -> str | None:
        request = (
            CreateMessageRequest.builder()
            .receive_id_type("chat_id")
            .request_body(
                CreateMessageRequestBody.builder()
                .receive_id(chat_id)
                .msg_type("interactive")
                .content(json.dumps(card))
                .build()
            )
            .build()
        )

        response = self._message.create(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card send failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return None

        msg_id = response.data.message_id if response.data else None
        return msg_id

    def update_card(self, message_id: str, card: dict[str, Any]) -> bool:
        request = (
            PatchMessageRequest.builder()
            .message_id(message_id)
            .request_body(
                PatchMessageRequestBody.builder().content(json.dumps(card)).build()
            )
            .build()
        )

        response = self._message.patch(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card update failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False
        return True

    def reply_card(self, message_id: str, card: dict[str, Any]) -> bool:
        request = (
            ReplyMessageRequest.builder()
            .message_id(message_id)
            .request_body(
                ReplyMessageRequestBody.builder()
                .msg_type("interactive")
                .content(json.dumps(card))
                .build()
            )
            .build()
        )

        response = self._message.reply(request)

        if not response.success():
            print(
                f"[{datetime.now().isoformat()}] [ERROR] Card reply failed: "
                f"code={response.code}, msg={response.msg}",
                flush=True,
            )
            return False
        return True
