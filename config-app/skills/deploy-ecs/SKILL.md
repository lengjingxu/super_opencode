---
name: deploy-ecs
description: 阿里云 ECS 部署 - 支持代码上传、服务部署、Nginx 配置
triggers:
  - ECS部署
  - 服务器部署
  - 部署到ECS
  - 上线到服务器
---

# 阿里云 ECS 部署 Skill

## 功能
- 代码上传到 ECS 服务器
- 服务启动和管理
- Nginx 反向代理配置
- SSL 证书配置
- PM2 进程管理

## 配置
在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "deploy": {
    "ecs": {
      "enabled": true,
      "host": "your-server-ip",
      "port": 22,
      "username": "root",
      "privateKey": "~/.ssh/id_rsa",
      "deployPath": "/var/www/app"
    }
  }
}
```

## 使用方式

### 部署代码
```
部署当前项目到 ECS 服务器
```

### 配置 Nginx
```
配置 Nginx 反向代理到 3000 端口
```

### 配置 SSL
```
为 example.com 配置 SSL 证书
```

## 部署流程

### 1. 代码上传
```bash
rsync -avz --exclude 'node_modules' ./ user@host:/var/www/app/
```

### 2. 安装依赖
```bash
ssh user@host "cd /var/www/app && npm install --production"
```

### 3. 启动服务
```bash
ssh user@host "cd /var/www/app && pm2 restart app || pm2 start npm --name app -- start"
```

### 4. 配置 Nginx
```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 支持的项目类型

| 类型 | 启动命令 | 进程管理 |
|------|----------|----------|
| Node.js | npm start | PM2 |
| Python | gunicorn | Supervisor |
| Java | java -jar | systemd |
| Go | ./app | systemd |

## 安全提示
- 使用 SSH 密钥认证，不使用密码
- 部署用户应有最小必要权限
- 敏感配置使用环境变量
