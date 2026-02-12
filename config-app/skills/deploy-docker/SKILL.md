---
name: deploy-docker
description: Docker 部署 - 支持镜像构建、推送到仓库、容器部署
triggers:
  - Docker部署
  - 构建镜像
  - 推送镜像
  - 容器化
---

# Docker 部署 Skill

## 功能
- 生成 Dockerfile
- 构建 Docker 镜像
- 推送到镜像仓库
- 部署到服务器

## 配置
在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "deploy": {
    "docker": {
      "enabled": true,
      "registry": "registry.cn-shanghai.aliyuncs.com",
      "namespace": "your_namespace",
      "username": "your_username",
      "password": "your_password"
    }
  }
}
```

## 使用方式

### 构建并推送
```
构建 Docker 镜像并推送到仓库
```

### 只构建
```
构建 Docker 镜像，不推送
```

### 部署到服务器
```
部署 Docker 镜像到服务器
```

## Dockerfile 模板

### Python (FastAPI)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Node.js (Express)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### Java (Spring Boot)
```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 多阶段构建
对于需要编译的项目，使用多阶段构建减小镜像体积：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```
