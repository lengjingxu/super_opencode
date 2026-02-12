# Super OpenCode

> 基于 [OpenCode](https://github.com/opencode-ai/opencode) + [Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) 的桌面配置工具，让多 Agent AI 编程开箱即用

<!-- ![Super OpenCode 主界面](screenshots/main.png) -->

## 这是什么？

[OpenCode](https://github.com/opencode-ai/opencode) 是一个强大的终端 AI 编程助手，[Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) 为它加上了多 Agent 协作、智能路由、防御性设计等能力。

但要用好这套组合，你需要：手动编辑多个 JSON 配置文件、自己找国内可用的 API 服务、逐个配置模型分配、手动安装和管理 Skills……

Super OpenCode 就是解决这个问题的 — 一个桌面应用，把这些繁琐的配置工作变成图形界面的点点选选。

## Super OpenCode 做了什么？

| 我们提供的 | 说明 |
|-----------|------|
| **🔧 服务配置** | 国内可直连的 API 代理预配置，支持 OpenRouter、硅基流动等中转服务，一键切换，不用折腾代理 |
| **🤖 Agent 管理配置** | 为每个 Agent / Category 分配模型，基于技术栈（Vue/React/FastAPI/Spring Boot 等）自动追加提示词 |
| **📱 飞书 Bot** | 通过飞书对话指挥 AI 写代码，手机上看进度、看 Diff、发指令，离开电脑也能推进项目 |
| **📦 Skill 整合** | 10+ 预制 Skill 开箱即用，统一管理和配置 |

### 不是我们做的（来自上游项目）

多 Agent 协作架构、智能路由、防御性设计（防失忆/防越界/防崩溃）、任务续接钩子等核心能力，都来自 [OpenCode](https://github.com/opencode-ai/opencode) 和 [Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode)。我们只是让这些能力更容易配置和使用。

## 功能详情

### 🔧 服务配置 — 国内直连，告别代理

OpenCode 内置的 Anthropic、OpenAI 等服务商在国内需要代理，且代理配置存在兼容性问题。

Super OpenCode 预配置了国内可直连的 API 服务，打开应用配好 Key 就能用。

<!-- ![服务配置界面](screenshots/service-config.png) -->

### 🤖 Agent 管理配置 — 按技术栈定制

不只是选模型。选择你的技术栈后，系统会自动为对应的 Agent 追加技术栈相关的提示词：

```
选择 Vue 3 + Tailwind  →  视觉代理自动注入 Vue 组件规范、Tailwind 类名约定
选择 Python + FastAPI   →  后端代理自动注入 Pydantic 模型、路由规范
```

支持的技术栈预设：

| 前端 | 后端 |
|------|------|
| Vue 3 + Tailwind + DaisyUI | Python + FastAPI |
| React + Next.js + shadcn/ui | Java + Spring Boot |
| Angular | Node.js + Express |
| 纯 HTML/CSS/JS | Go + Gin |

<!-- ![Agent 配置界面](screenshots/agent-config.png) -->

### 📱 飞书 Bot — 离开电脑，AI 不停工

通过飞书 Bot 接入 OpenCode，手机上也能指挥 AI 写代码：

<!-- ![飞书 Bot](screenshots/feishu-bot.png) -->

- 自然语言对话，像跟同事聊天一样指挥 AI
- 实时进度可视化（Todo 进度条、Diff、Git 状态）
- 快捷命令：`/t` 看任务 · `/d` 看 Diff · `/x` 紧急终止
- 零公网依赖，WebSocket 长连接，全程本地运行

### 📦 Skill 整合 — 给 AI 装上工具箱

预制 Skill 统一打包，开箱即用：

| Skill | 能力 |
|-------|------|
| `ui-ux-pro-max` | 67 种设计风格、96 种配色方案、57 组字体搭配 |
| `deploy-fc` / `deploy-ecs` / `deploy-docker` | 阿里云函数计算 / ECS / Docker 一键部署 |
| `sql-query` | 数据库连接、查询、数据分析 |
| `image-generator` | Stable Diffusion API 图片生成 |
| `test-runner` | 自动化测试生成与执行 |
| `notification` | 飞书 / 企业微信 / 钉钉通知推送 |
| `git-master` | Git 操作规范 |
| `log-standard` | 前后端日志规范 |

## 快速开始

### 下载安装

从 [Releases](https://github.com/lengjingxu/super_opencode/releases) 下载最新版本：

- macOS Apple Silicon: `Super.OpenCode-x.x.x-arm64.dmg`
- macOS Intel: `Super.OpenCode-x.x.x.dmg`

### 使用流程

```
打开应用 → 安装 OpenCode → 安装 Oh-My-OpenCode 
    → 选择技术栈 → 配置 API Key → 完成！
```

然后在终端运行 `opencode` 开始 AI 辅助编程。

## 开发

```bash
cd config-app

# 安装依赖
npm install

# 开发模式
npm start

# 构建
npm run build:mac
```

## 项目结构

```
├── config-app/          # Electron 桌面应用
│   ├── src/             # 主界面 HTML
│   ├── lib/             # 核心服务（配置管理、托管服务）
│   ├── skills/          # 内置 Skills
│   ├── templates/       # 配置模板
│   ├── feishu_bot/      # 飞书 Bot 模块
│   └── client/          # OpenCode 客户端 (SolidJS)
├── landing-page/        # 产品介绍页
├── templates/           # 全局配置模板
└── tech-stacks/         # 技术栈预设配置
```

## 致谢

本项目是 OpenCode + Oh-My-OpenCode 的配置工具和能力整合，核心 AI 编程能力来自：

- [OpenCode](https://github.com/opencode-ai/opencode) — 终端 AI 编程助手
- [Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) — 多 Agent 协作框架

## License

MIT
