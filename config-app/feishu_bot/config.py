import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class FeishuConfig:
    app_id: str
    app_secret: str
    opencode_path: str = "opencode"
    working_dir: Optional[str] = None
    model: str = "fox-cc/claude-opus-4-6"
    log_level: str = "INFO"
    opencode_server_host: str = "127.0.0.1"
    opencode_server_port: int = 4096
    opencode_server_password: Optional[str] = "test123"
    use_server_mode: bool = True

    @classmethod
    def from_env(cls) -> "FeishuConfig":
        return cls(
            app_id=os.environ["FEISHU_APP_ID"],
            app_secret=os.environ["FEISHU_APP_SECRET"],
            opencode_path=os.environ.get("OPENCODE_PATH", "opencode"),
            working_dir=os.environ.get("OPENCODE_WORKING_DIR"),
            model=os.environ.get("OPENCODE_MODEL", "fox-cc/claude-opus-4-6"),
            log_level=os.environ.get("FEISHU_LOG_LEVEL", "INFO"),
            opencode_server_host=os.environ.get("OPENCODE_SERVER_HOST", "127.0.0.1"),
            opencode_server_port=int(os.environ.get("OPENCODE_SERVER_PORT", "4096")),
            opencode_server_password=os.environ.get("OPENCODE_SERVER_PASSWORD"),
            use_server_mode=os.environ.get("OPENCODE_USE_SERVER", "true").lower()
            in ("true", "1", "yes"),
        )

    @property
    def server_base_url(self) -> str:
        return f"http://{self.opencode_server_host}:{self.opencode_server_port}"
