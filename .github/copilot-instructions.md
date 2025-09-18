# Copilot Instructions for rewind-pearl

## 项目架构概览
- 本项目为多页面 Web 游戏，主入口为 `index.html`，核心游戏逻辑在 `game/` 目录下。
- 主要分区：
  - `game/`：游戏主模块，含资源、脚本、样式、关卡编辑器等。
  - `about/`：成员个人页面，风格各异，独立维护。
  - `achievements/`：成就展示页面。
  - `docs/`：开发文档与计划。

## 游戏模块结构
- `game/script/`：核心 JS 逻辑，推荐从 `main.js`、`Game2D.js`、`Dialogue.js` 入手理解主循环、事件处理、对话系统。
- `game/assets/`：资源文件，分为 `character/`（角色）、`dialogue/`（对话脚本）、`background/`、`audio/` 等，统一在 `manifest.json` 中进行声明。
- `game/assets/dialogue/README.md`：详细说明对话脚本 JSON 规范，编写剧情时务必遵循。
- `game/style/`：游戏相关 CSS，按功能拆分。

## 项目约定与模式
- **游戏脚本模块化**，每个功能独立 JS 文件，避免全局变量污染。
- **资源命名规范**：角色资源需与脚本 `key` 字段一致，图片、音频等按用途归类。
- **对话事件驱动**：剧情推进依赖 JSON 事件流，详见 `Dialogue.js`。
- **样式标记**：对话文本支持 `$样式类名:文本内容$`，详见对话脚本规范。

## 重要文件/目录
- `game/script/main.js`：游戏入口，初始化主循环。
- `game/script/Game2D.js`：2D 游戏核心逻辑。
- `game/script/Dialogue.js`：对话系统，解析 JSON 剧本。
- `game/assets/dialogue/`：所有 JSON 格式剧情脚本。
- `game/assets/character/`：角色立绘资源。
- `game/assets/background/`：场景背景资源。

## 其他说明
- **无统一测试框架**，调试以浏览器为主。
- **无后端/数据库集成**，所有数据本地存储。
- **无外部依赖**：游戏模块不依赖第三方库。
