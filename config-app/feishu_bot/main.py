#!/usr/bin/env python3
import argparse
import os
import signal
import sys

from feishu_bot import FeishuConfig, FeishuBot


def _kill_stale_bots() -> None:
    """Kill other feishu_bot.main processes before starting."""
    my_pid = os.getpid()
    try:
        import subprocess

        result = subprocess.run(
            ["pgrep", "-f", "feishu_bot.main"],
            capture_output=True,
            text=True,
        )
        for line in result.stdout.strip().splitlines():
            pid = int(line.strip())
            if pid == my_pid:
                continue
            try:
                os.kill(pid, signal.SIGTERM)
                print(f"Killed stale feishu_bot process: {pid}", flush=True)
            except ProcessLookupError:
                pass
    except Exception:
        pass


def main():
    _kill_stale_bots()
    parser = argparse.ArgumentParser(
        description="Feishu Bot - OpenCode Integration via WebSocket"
    )
    parser.add_argument("--app-id", help="Feishu App ID (or set FEISHU_APP_ID env)")
    parser.add_argument(
        "--app-secret", help="Feishu App Secret (or set FEISHU_APP_SECRET env)"
    )
    parser.add_argument(
        "--opencode-path",
        default="opencode",
        help="Path to opencode CLI (default: opencode)",
    )
    parser.add_argument("--working-dir", help="Working directory for opencode")
    parser.add_argument(
        "--model",
        default="fox-cc/claude-opus-4-6",
        help="OpenCode model (default: fox-cc/claude-opus-4-6)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Log level: DEBUG/INFO/WARN/ERROR (default: INFO)",
    )
    parser.add_argument(
        "--server-host",
        help="OpenCode server host (or OPENCODE_SERVER_HOST env, default: 127.0.0.1)",
    )
    parser.add_argument(
        "--server-port",
        type=int,
        help="OpenCode server port (or OPENCODE_SERVER_PORT env, default: 4096)",
    )
    parser.add_argument(
        "--server-password",
        help="OpenCode server password (or OPENCODE_SERVER_PASSWORD env)",
    )
    parser.add_argument(
        "--no-server",
        action="store_true",
        help="Disable server mode, use CLI subprocess fallback",
    )

    args = parser.parse_args()

    app_id = args.app_id or os.environ.get("FEISHU_APP_ID")
    app_secret = args.app_secret or os.environ.get("FEISHU_APP_SECRET")

    if not app_id:
        print(
            "Error: App ID required. Use --app-id or set FEISHU_APP_ID env",
            file=sys.stderr,
        )
        sys.exit(1)
    if not app_secret:
        print(
            "Error: App Secret required. Use --app-secret or set FEISHU_APP_SECRET env",
            file=sys.stderr,
        )
        sys.exit(1)

    server_host = args.server_host or os.environ.get(
        "OPENCODE_SERVER_HOST", "127.0.0.1"
    )
    server_port = args.server_port or int(
        os.environ.get("OPENCODE_SERVER_PORT", "4096")
    )
    server_password = args.server_password or os.environ.get("OPENCODE_SERVER_PASSWORD")
    use_server = not args.no_server

    config = FeishuConfig(
        app_id=app_id,
        app_secret=app_secret,
        opencode_path=args.opencode_path,
        working_dir=args.working_dir,
        model=args.model,
        log_level=args.log_level,
        opencode_server_host=server_host,
        opencode_server_port=server_port,
        opencode_server_password=server_password,
        use_server_mode=use_server,
    )

    bot = FeishuBot(config)
    bot.start()


if __name__ == "__main__":
    main()
