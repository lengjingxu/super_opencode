# Super OpenCode

> 基于 [OpenCode](https://github.com/opencode-ai/opencode) + [Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) 的桌面配置工具，个人使用经验的整理与打包

## 声明

本项目是对以下两个优秀开源项目的**配置打包和个人实践整理**，核心能力完全来自原始项目：

| 原始项目 | 作者 | 说明 |
|---------|------|------|
| [**OpenCode**](https://github.com/opencode-ai/opencode) | opencode-ai | 终端 AI 编程助手，支持多模型、会话管理、LSP 集成，是本项目的核心引擎 |
| [**Oh-My-OpenCode**](https://github.com/pinkpixel-dev/oh-my-opencode) | pinkpixel-dev | OpenCode 的多代理协作框架，提供 Sisyphus、Oracle 等代理架构和 Skill 机制 |

**如果你觉得好用，请去给原始项目 Star ⭐️**

Super OpenCode 本身只做了一件事：把这两个项目的安装、配置、Skill 管理流程包装成一个桌面应用，降低上手门槛。

## 这个项目做了什么

简单说，就是把手动配置 OpenCode + Oh-My-OpenCode 的过程自动化了：

- 一键安装 OpenCode 和 Oh-My-OpenCode
- 图形界面管理模型配置（不用手编 JSON）
- 内置一些个人整理的 Skill（部署、测试、UI 设计等）
- 适配中国网络环境（API 代理、中转服务配置）
- 桌面应用自动更新

不涉及对 OpenCode 或 Oh-My-OpenCode 核心代码的修改。

## 关于 OpenCode

[OpenCode](https://github.com/opencode-ai/opencode) 是一个运行在终端的 AI 编程助手，主要特性：

- 支持 Anthropic、OpenAI 等多家模型提供商
- 内置 LSP 集成，理解代码上下文
- 会话管理、文件编辑、终端命令执行
- 完全开源，Go 语言编写

详见 👉 [OpenCode GitHub](https://github.com/opencode-ai/opencode)

## 关于 Oh-My-OpenCode

[Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) 为 OpenCode 提供了多代理协作能力：

- **Sisyphus** - 主代理，任务分解和协调
- **Oracle** - 高智商顾问，复杂推理和架构决策
- **Explore / Librarian** - 代码库探索和文档检索
- **Prometheus / Momus** - 任务规划和方案审查
- **Skill 机制** - 通过结构化指令约束 AI 行为，注入领域知识

详见 👉 [Oh-My-OpenCode GitHub](https://github.com/pinkpixel-dev/oh-my-opencode)

## 本项目额外整理的内容

基于个人使用经验，整理了一些 Skill 和配置：

| Skill | 说明 |
|-------|------|
| `ui-ux-pro-max` | UI/UX 设计辅助 |
| `deploy-fc` / `deploy-ecs` / `deploy-docker` | 阿里云部署 |
| `sql-query` | 数据库查询 |
| `test-runner` | 测试执行框架 |
| `image-generator` | 图片素材生成 |
| `notification` | 飞书/企业微信/钉钉通知 |

以及中国网络环境下的适配方案（API 代理、OpenRouter/硅基流动等中转服务配置）。

## 快速开始

### 下载安装

从 [Releases](https://github.com/lengjingxu/oh-my-opencode-releases/releases) 下载最新版本：
- macOS Intel: `Super-OpenCode-x.x.x.dmg`
- macOS Apple Silicon: `Super-OpenCode-x.x.x-arm64.dmg`

### 使用流程

```
打开应用 → 安装 OpenCode → 安装 Oh-My-OpenCode 
    → 选择技术栈 → 配置 API Key → 完成！
```

然后在终端使用 `opencode` 命令开始 AI 辅助编程。

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm start

# 构建
npm run build:mac
```

## 致谢

本项目的所有核心能力来自：

- **[OpenCode](https://github.com/opencode-ai/opencode)** - AI 编程助手核心引擎
- **[Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode)** - 多代理协作框架

感谢这些项目的作者和贡献者们。本项目只是在他们工作的基础上做了配置打包和使用经验整理，方便更多人快速上手。

## License

MIT
