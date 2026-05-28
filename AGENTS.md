# AGENTS.md

本文件为 Codex (Codex.ai/code) 在此仓库中工作时提供指引。

## 项目概述

NewsNow 是一个实时新闻聚合阅读器，抓取 40+ 中文（及部分英文）新闻源的热门话题。技术栈为 React 19 + Nitro/H3 全栈，SQLite 做缓存。支持 PWA、GitHub OAuth 登录、MCP 服务端供 AI 集成。

## 常用命令

```sh
pnpm i                 # 安装依赖（需要 Node >= 20，通过 corepack 启用 pnpm）
pnpm dev               # 开发服务器（自动执行 presource + vite dev）
pnpm build             # 生产构建
pnpm start             # 运行构建产物
pnpm lint              # ESLint 检查
pnpm typecheck         # TypeScript 类型检查
pnpm test              # Vitest 测试
```

**环境配置**：将 `example.env.server` 复制为 `.env.server`。登录相关配置 `G_CLIENT_ID`、`G_CLIENT_SECRET`、`JWT_SECRET`；数据库相关 `INIT_TABLE`、`ENABLE_CACHE`。

**部署预设**（通过环境变量设置）：
- 默认：Node.js + better-sqlite3
- `CF_PAGES=1`：Cloudflare Pages + D1
- `VERCEL=1`：Vercel Edge
- `BUN=1`：Bun 运行时

## 架构

### 路径别名
- `~/*` → `src/*`（前端）
- `@shared/*` → `shared/*`（前后端共享）
- `#/*` → `server/*`（服务端）

### 自动导入
前后端均通过 `unimport` 实现自动导入。`src/hooks/`、`src/utils/`、`src/atoms/`、`shared/` 中的导出会被自动导入，通常无需手动 import。

### 新闻源系统（核心功能）
新闻源在 `shared/pre-sources.ts` 中声明式定义，每个源对应 `server/sources/` 中的一个抓取器。构建步骤 `presource` 会从定义生成 `shared/sources.json` 和 `shared/pinyin.json`。

`server/utils/source.ts` 中提供三种抓取器模式：
- `defineSource(fn)` — 自定义抓取
- `defineRSSSource(url)` — RSS/Atom 订阅解析
- `defineRSSHubSource(route)` — RSSHub 集成

**添加新源**：在 `shared/pre-sources.ts` 添加定义 → 在 `server/sources/` 创建抓取器 → 执行 `pnpm run presource`。

### API 路由
Nitro/H3 基于文件的路由——`server/api/` 目录结构即 API 端点。`server/middleware/auth.ts` 处理 `/api/*` 路由的 JWT 验证。

### 前端状态管理
- Jotai atoms（`src/atoms/`）管理客户端状态
- TanStack Query 负责数据请求（`src/hooks/query.ts`）
- 用户偏好（栏目排序、关注源）通过 `primitiveMetadataAtom` 持久化，经 `useSync` hook 与服务端同步

### 构建流程
`pnpm build` 依次执行：favicon 下载 → 源 JSON 生成 → Vite 构建（React SWC + TanStack Router + UnoCSS + PWA + Nitro server）。产物输出至 `dist/output/public/`（静态资源）和 `dist/output/server/`（服务端）。

### 数据库
使用 `db0` 配合平台特定驱动。表结构在 `server/database/cache.ts`（新闻缓存）和 `server/database/user.ts`（用户数据）。
