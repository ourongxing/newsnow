# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 技术栈

React 19 + TypeScript (strict) + Vite 7 + Nitro (H3) 后端 + UnoCSS + Jotai 状态管理 + TanStack Router + pnpm 10

## 常用命令

- `pnpm dev` — 启动开发服务器 (Vite + Nitro)
- `pnpm build` — 构建前后端
- `pnpm test` — 运行 Vitest 测试
- `pnpm lint` — ESLint 检查
- `pnpm typecheck` — TypeScript 类型检查 (同时检查 tsconfig.node.json 和 tsconfig.app.json)
- `pnpm presource` — 从 `shared/pre-sources.ts` 重新生成 `shared/sources.json`

## 包管理器

必须使用 **pnpm**，不要用 npm 或 yarn。`corepack enable` 可自动启用。

## 自动生成的文件 — 不要手动编辑

- `shared/sources.json` — 由 `pnpm presource` 从 `shared/pre-sources.ts` 生成
- `src/routeTree.gen.ts` — TanStack Router 自动生成
- `imports.app.d.ts` — Unimport 插件自动生成的类型声明

## 路径别名

- 前端: `~/` → `src/`, `@shared/` → `shared/`
- 后端: `#/` → `server/`, `@shared/` → `shared/`

## 环境变量

本地开发需要 `.env.server` 文件 (从 `example.env.server` 复制)。关键变量:
- `G_CLIENT_ID` / `G_CLIENT_SECRET` — GitHub OAuth
- `JWT_SECRET` — JWT 签名
- `INIT_TABLE=true` — 首次运行时需要

## 添加新闻源

1. 在 `shared/pre-sources.ts` 中定义源
2. 运行 `pnpm presource` 重新生成
3. 在 `server/sources/` 目录下实现 fetcher (使用 `defineSource()`)
4. 详细步骤见 `CONTRIBUTING.md`

## 数据库

- 本地: better-sqlite3 (数据存储在 `.data/`)
- 生产: Cloudflare D1 (需配置 `wrangler.toml`)

## 部署预设

通过环境变量选择: `CF_PAGES=1` → Cloudflare Pages, `VERCEL=1` → Vercel Edge, `BUN=1` → Bun, 默认 → Node.js

## 代码风格

- ESLint 配置: `@ourongxing/eslint-config`，无 Prettier
- TypeScript strict 模式，`noUnusedLocals` 和 `noUnusedParameters` 均开启
- 前端使用 auto-import (React hooks、Jotai atoms、`clsx` as `$` 等)，无需手动导入

## 依赖兼容性说明

- `nitropack` 通过 resolutions 映射为 `nitro-go@0.0.3`
- `vite-plugin-with-nitro` 的 h3 依赖通过 `pnpm.overrides` 锁定为 `h3-nightly@1.15.4` (v1 系列)，避免与 h3 v2 不兼容
