---
name: notification
description: 通知服务 - 支持飞书/企业微信/钉钉 Webhook 通知
triggers:
  - 发送通知
  - 通知
  - 飞书
  - 企业微信
  - 钉钉
---

# 通知服务 Skill

## 功能
- 任务完成时发送通知
- 需要用户输入时发送通知
- 任务失败时发送通知
- 支持飞书/企业微信/钉钉

## 配置
在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "notification": {
    "desktop": {
      "enabled": true,
      "sound": true
    },
    "webhook": {
      "enabled": true,
      "platform": "wecom",
      "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
      "secret": ""
    },
    "triggers": ["task_complete", "need_input", "error"]
  }
}
```

## 平台配置

### 飞书
```json
{
  "platform": "feishu",
  "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
}
```

### 企业微信
```json
{
  "platform": "wecom",
  "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
}
```

### 钉钉
```json
{
  "platform": "dingtalk",
  "webhook_url": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
  "secret": "SECxxx"
}
```

## 通知触发条件

| 触发条件 | 说明 |
|----------|------|
| task_complete | 任务完成时 |
| need_input | 需要用户输入时 |
| error | 任务出错时 |

## 消息格式

### 任务完成
```
✅ OpenCode 任务已完成

项目：my-project
任务：实现用户登录功能
耗时：5 分钟
```

### 需要输入
```
⚠️ OpenCode 需要您的输入

项目：my-project
问题：请确认是否删除旧数据？
```

### 任务失败
```
❌ OpenCode 任务出错

项目：my-project
错误：测试失败 - test_user.py::test_login
```
