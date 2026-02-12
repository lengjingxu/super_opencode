---
name: log-standard
description: 日志规范 Skill - 定义前后端日志格式要求，确保可追溯性
triggers:
  - 日志
  - 日志规范
  - 添加日志
  - 日志格式
---

# 日志规范 Skill

## 日志格式要求

### 统一格式
```
[时间戳] [级别] [模块/类名] 消息内容
```

示例：
```
[2025-02-01 10:30:45] [INFO] [UserService] 用户登录成功: userId=12345
[2025-02-01 10:30:46] [ERROR] [OrderService] 订单创建失败: orderId=67890, error=库存不足
```

## 后端日志要求

### Python (loguru)
```python
from loguru import logger

# 配置
logger.add("logs/app.log", rotation="1 day", retention="7 days")

# 使用
logger.info(f"用户登录成功: userId={user_id}")
logger.error(f"订单创建失败: orderId={order_id}, error={str(e)}")
```

### Java (SLF4J + Logback)
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger logger = LoggerFactory.getLogger(UserService.class);

logger.info("用户登录成功: userId={}", userId);
logger.error("订单创建失败: orderId={}, error={}", orderId, e.getMessage());
```

### Node.js (winston)
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => 
      `[${timestamp}] [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()]
});

logger.info(`用户登录成功: userId=${userId}`);
```

## 前端日志要求

### 结构化 console.log
```javascript
// 封装日志函数
const log = {
  info: (module, message, data = {}) => {
    console.log(`[${new Date().toISOString()}] [INFO] [${module}]`, message, data);
  },
  error: (module, message, error = null) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${module}]`, message, error);
  }
};

// 使用
log.info('UserPage', '用户点击登录按钮', { userId: 123 });
log.error('API', '请求失败', error);
```

## 必须记录日志的场景

### 后端
- [ ] 用户认证（登录/登出/注册）
- [ ] 关键业务操作（订单/支付/数据修改）
- [ ] 外部 API 调用
- [ ] 异常和错误
- [ ] 定时任务执行

### 前端
- [ ] 页面访问
- [ ] 关键用户操作
- [ ] API 请求/响应
- [ ] 错误捕获

## 日志级别使用

| 级别 | 使用场景 |
|------|----------|
| DEBUG | 开发调试信息 |
| INFO | 正常业务流程 |
| WARN | 潜在问题，但不影响功能 |
| ERROR | 错误，需要关注 |
| FATAL | 严重错误，系统无法继续 |
