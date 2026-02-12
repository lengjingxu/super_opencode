#!/bin/bash
# Oh-My-OpenCode Webhook 通知脚本
# 支持飞书、企业微信、钉钉

set -e

EVENT_TYPE=$1
PROJECT_NAME=${2:-"OpenCode"}
MESSAGE=${3:-""}

# 配置文件路径
CONFIG_FILE="$HOME/.config/opencode/credentials.json"

# 检查配置文件
if [ ! -f "$CONFIG_FILE" ]; then
    echo "配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo "请先安装 jq: brew install jq"
    exit 1
fi

# 读取配置
WEBHOOK_ENABLED=$(jq -r '.notification.webhook.enabled // false' "$CONFIG_FILE")
if [ "$WEBHOOK_ENABLED" != "true" ]; then
    echo "Webhook 通知未启用"
    exit 0
fi

PLATFORM=$(jq -r '.notification.webhook.platform // "wecom"' "$CONFIG_FILE")
WEBHOOK_URL=$(jq -r '.notification.webhook.webhook_url // ""' "$CONFIG_FILE")
SECRET=$(jq -r '.notification.webhook.secret // ""' "$CONFIG_FILE")

if [ -z "$WEBHOOK_URL" ]; then
    echo "Webhook URL 未配置"
    exit 1
fi

# 根据事件类型生成消息
case $EVENT_TYPE in
    "complete")
        TITLE="✅ 任务完成"
        CONTENT="项目：$PROJECT_NAME\n任务已完成"
        if [ -n "$MESSAGE" ]; then
            CONTENT="$CONTENT\n详情：$MESSAGE"
        fi
        ;;
    "permission")
        TITLE="⚠️ 需要输入"
        CONTENT="项目：$PROJECT_NAME\nOpenCode 需要您的输入"
        if [ -n "$MESSAGE" ]; then
            CONTENT="$CONTENT\n问题：$MESSAGE"
        fi
        ;;
    "error")
        TITLE="❌ 任务出错"
        CONTENT="项目：$PROJECT_NAME\n任务执行出错"
        if [ -n "$MESSAGE" ]; then
            CONTENT="$CONTENT\n错误：$MESSAGE"
        fi
        ;;
    *)
        TITLE="📢 OpenCode 通知"
        CONTENT="项目：$PROJECT_NAME"
        if [ -n "$MESSAGE" ]; then
            CONTENT="$CONTENT\n$MESSAGE"
        fi
        ;;
esac

# 发送通知
send_feishu() {
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"msg_type\": \"post\",
            \"content\": {
                \"post\": {
                    \"zh_cn\": {
                        \"title\": \"$TITLE\",
                        \"content\": [[{\"tag\": \"text\", \"text\": \"$(echo -e $CONTENT)\"}]]
                    }
                }
            }
        }"
}

send_wecom() {
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"msgtype\": \"markdown\",
            \"markdown\": {
                \"content\": \"### $TITLE\n$(echo -e $CONTENT)\"
            }
        }"
}

send_dingtalk() {
    TIMESTAMP=$(date +%s%3N)
    
    if [ -n "$SECRET" ]; then
        # 计算签名
        STRING_TO_SIGN="${TIMESTAMP}\n${SECRET}"
        SIGN=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64 | sed 's/+/%2B/g; s/\//%2F/g; s/=/%3D/g')
        WEBHOOK_URL="${WEBHOOK_URL}&timestamp=${TIMESTAMP}&sign=${SIGN}"
    fi
    
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"msgtype\": \"markdown\",
            \"markdown\": {
                \"title\": \"$TITLE\",
                \"text\": \"### $TITLE\n$(echo -e $CONTENT)\"
            }
        }"
}

# 根据平台发送
case $PLATFORM in
    "feishu")
        send_feishu
        ;;
    "wecom")
        send_wecom
        ;;
    "dingtalk")
        send_dingtalk
        ;;
    *)
        echo "不支持的平台: $PLATFORM"
        exit 1
        ;;
esac

echo "通知已发送"
