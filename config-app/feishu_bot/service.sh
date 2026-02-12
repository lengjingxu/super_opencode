#!/bin/bash

PLIST_NAME="com.lengjingxu.feishu-bot.plist"
PLIST_SRC="$(dirname "$0")/$PLIST_NAME"
PLIST_DST="$HOME/Library/LaunchAgents/$PLIST_NAME"

case "$1" in
    install)
        cp "$PLIST_SRC" "$PLIST_DST"
        launchctl load "$PLIST_DST"
        echo "✅ Feishu Bot service installed and started"
        echo "   Logs: $(dirname "$0")/bot.log"
        ;;
    uninstall)
        launchctl unload "$PLIST_DST" 2>/dev/null
        rm -f "$PLIST_DST"
        echo "✅ Feishu Bot service uninstalled"
        ;;
    start)
        launchctl start com.lengjingxu.feishu-bot
        echo "✅ Feishu Bot started"
        ;;
    stop)
        launchctl stop com.lengjingxu.feishu-bot
        echo "✅ Feishu Bot stopped"
        ;;
    restart)
        launchctl stop com.lengjingxu.feishu-bot
        launchctl start com.lengjingxu.feishu-bot
        echo "✅ Feishu Bot restarted"
        ;;
    status)
        launchctl list | grep feishu-bot && echo "✅ Running" || echo "❌ Not running"
        ;;
    logs)
        tail -f "$(dirname "$0")/bot.log"
        ;;
    *)
        echo "Usage: $0 {install|uninstall|start|stop|restart|status|logs}"
        exit 1
        ;;
esac
