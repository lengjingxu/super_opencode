# Super OpenCode

> 整合 OpenCode + Oh-My-OpenCode，自动化应用最佳实践的 AI 编程助手配置中心

## 项目定位

Super OpenCode 是一个**一站式 AI 编程环境配置工具**，旨在：

1. **整合最佳实践** - 将 OpenCode 和 Oh-My-OpenCode 的强大能力整合到一个易用的桌面应用中
2. **自动化配置** - 用户无需手动编辑配置文件，通过图形界面即可完成所有设置
3. **开箱即用** - 下载安装后，按向导完成配置，立即开始 AI 辅助编程

## 核心理念

### 🧠 多模型协作

不同的任务需要不同的模型能力：
- **推理型模型** (Claude Opus, o1) - 处理复杂架构设计、疑难 Bug 分析
- **快速型模型** (Claude Sonnet, GPT-4o) - 日常编码、快速迭代
- **专项模型** - 代码补全、文档生成等特定任务

Super OpenCode 让你为不同场景配置最合适的模型，实现成本与效果的最优平衡。

### 🤖 多代理分工

基于 Oh-My-OpenCode 的多代理架构：
- **Sisyphus** - 主代理，负责任务分解和协调
- **Oracle** - 高智商顾问，处理复杂推理和架构决策
- **Explore** - 代码库探索专家
- **Librarian** - 文档和外部资源检索
- **Prometheus** - 任务规划
- **Momus** - 方案审查

每个代理专注于自己擅长的领域，协作完成复杂任务。

### 📋 Skill 流程控制

通过 Skill 机制约束 AI 行为：
- **结构化指令** - 避免 AI 不按要求执行
- **领域知识注入** - 为特定任务提供专业上下文
- **可复用流程** - 将最佳实践封装为可复用的 Skill

内置 Skill 包括：
- `ui-ux-pro-max` - UI/UX 设计智能
- `git-master` - Git 操作规范
- `test-runner` - 测试执行框架
- `deploy-fc` / `deploy-ecs` / `deploy-docker` - 部署能力

### 🛠️ AI 自主能力扩展

为 AI 提供更多自主完成工作的能力：

| 能力 | 说明 |
|------|------|
| **图片素材生成** | 通过 Stable Diffusion API 生成项目所需图片 |
| **SQL 查询** | 直接连接数据库执行查询，理解数据结构 |
| **服务器部署** | 自动部署到阿里云函数计算、ECS、Docker |
| **通知推送** | 任务完成后通过飞书/企业微信/钉钉通知 |

## 解决的问题

### 🌐 中国网络环境适配

OpenCode 内置的服务商（Anthropic、OpenAI 等）在中国网络环境下需要代理，但 OpenCode 的代理配置存在兼容性问题。

Super OpenCode 解决方案：
- 支持配置国内可直连的 API 代理服务
- 支持 OpenRouter、硅基流动等中转服务
- 一键配置，无需手动处理代理问题

## 功能特性

### 安装向导
- 自动检测并安装 OpenCode
- 自动安装 Oh-My-OpenCode 插件
- 技术栈选择（前端/后端）
- API Key 配置
- 个性化设置

### 配置管理
- 模型配置 - 为不同代理/场景配置模型
- Skill 管理 - 启用/配置各种 Skill
- 全局规范编辑 - 编辑 AGENTS.md
- 备份还原 - 配置版本管理

### 自动更新
- 基于 GitHub Releases 的热更新
- 后台检测新版本
- 一键下载安装，无需手动下载

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

## 发布新版本

### 发布流程

```bash
# 1. 修改 package.json 中的 version（如 1.0.1 → 1.0.2）

# 2. 构建并发布到 GitHub Releases
GH_TOKEN=$(gh auth token) npm run publish:mac
```

### 注意事项

1. **确保 latest-mac.yml 上传成功** - 这是热更新的关键文件
2. **版本号必须递增** - electron-updater 通过版本号判断是否有新版本
3. **发布后验证** - 运行 `gh release view vX.X.X --repo lengjingxu/oh-my-opencode-releases` 确认文件完整

## 致谢

本项目基于以下优秀开源项目构建：

- **[OpenCode](https://github.com/opencode-ai/opencode)** - 强大的 AI 编程助手核心
- **[Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode)** - 多代理协作框架

感谢这些项目的作者和贡献者们，是他们的工作让 AI 辅助编程变得更加强大和易用。

## License

MIT
