# AI Project Handoff Rules

## First Read

1. README.md
2. START-HERE.md
3. AGENTS.md
4. graphify-out/GRAPH_REPORT.md when available

## 语言/技术栈

- Node.js 项目，使用 `pnpm` 或对应包管理器
- 阅读 `package.json` 了解 scripts 和依赖
- 入口可能在 `src/`、`app/`、`pages/` 之一

## Existing Project Boundary

- 保留现有源码结构、构建系统、技术栈、业务命名。
- 不要重命名业务目录、不要替换框架、不要全仓格式化，除非用户显式要求。
- 仅补 AI 接手所需的文档与资产；不改业务行为。

## Assets

- 视觉资产优先放到 `assets/` 根级；若项目已有自己的资产约定，沿用原结构。
- README 展示图必须直接写 `![label](path)`，不能放进 fenced code block。
