# NewsNow 项目初始化与持续迭代指南

## 📋 项目概述

这是一个从原项目 fork 的 NewsNow 新闻聚合平台,使用 React 19 + Nitro + TypeScript 构建。

- **原始项目**: https://github.com/ourongxing/newsnow
- **当前版本**: v0.0.36
- **开发分支**: `claude/setup-forked-project-011CUwSjRkkzC5MMNQCjupAV`

---

## 🚀 快速开始

### 1️⃣ 环境准备

确保已安装:
- **Node.js** >= 20
- **pnpm** 10.14.0+ (通过 corepack 启用)

### 2️⃣ 初始化项目

已完成的配置步骤:
```bash
# ✅ 已完成: 启用 pnpm 并安装依赖
corepack enable
pnpm install

# ✅ 已完成: 创建环境变量文件
# 文件位置: .env.server

# ✅ 已完成: 生成 source 定义和 favicons
npm run presource

# ✅ 已完成: 验证构建
npm run build
```

### 3️⃣ 配置 GitHub OAuth (可选)

如需启用用户登录和数据同步功能:

1. 访问 https://github.com/settings/applications/new 创建 OAuth App
2. 配置回调地址:
   - 开发环境: `http://localhost:4444/api/oauth/callback`
   - 生产环境: `https://yourdomain.com/api/oauth/callback`
3. 在 `.env.server` 中填写:
   ```env
   G_CLIENT_ID=你的Client ID
   G_CLIENT_SECRET=你的Client Secret
   JWT_SECRET=你的Client Secret (或其他随机字符串)
   ```

### 4️⃣ 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173 (端口可能不同,查看终端输出)

---

## 🔄 持续迭代开发 (Spec Kit 方式)

### 开发流程

使用 **spec-driven development** 方式进行功能迭代:

#### 1. 创建功能规格说明

在项目根目录创建 `.specs/` 目录 (如果不存在):

```bash
mkdir -p .specs
```

为新功能创建规格文件:

```markdown
# .specs/add-reddit-source.md

## 功能描述
添加 Reddit 热门新闻源

## 实现步骤
1. 在 `/shared/pre-sources.ts` 注册 Reddit 源
2. 在 `/server/sources/reddit.ts` 实现获取逻辑
3. 测试并验证数据格式

## 数据格式
- 使用 Reddit JSON API: https://www.reddit.com/r/all/top.json
- 返回格式符合 NewsItem 接口

## 测试计划
- 手动测试 API 响应
- 验证标题、链接、时间戳正确性
```

#### 2. 实现功能

按照规格说明实现功能,使用以下命令:

```bash
# 实时编译 TypeScript
npm run dev

# 运行测试
npm run test

# 类型检查
npm run typecheck

# 代码规范检查
npm run lint
```

#### 3. 验证功能

```bash
# 生成 source 定义
npm run presource

# 本地预览
npm run dev
```

#### 4. 提交代码

```bash
git add .
git commit -m "feat(source): add reddit"
git push origin claude/setup-forked-project-011CUwSjRkkzC5MMNQCjupAV
```

---

## 📦 添加新的新闻源

### 完整示例

#### 步骤 1: 注册源定义

编辑 `/shared/pre-sources.ts`:

```typescript
export const preSources = {
  // ... 其他源
  reddit: {
    type: "reddit",
    name: "Reddit",
    color: "#FF4500",
    home: "https://www.reddit.com",
    interval: 1800, // 30分钟
    categories: ["tech"],
  },
} as const satisfies Record<string, PreSource>
```

#### 步骤 2: 实现获取器

创建 `/server/sources/reddit.ts`:

```typescript
export default defineSource(async () => {
  const data = await myFetch("https://www.reddit.com/r/all/top.json?limit=25")

  return data.data.children.map((item: any) => ({
    id: item.data.id,
    title: item.data.title,
    url: `https://www.reddit.com${item.data.permalink}`,
    extra: {
      info: `${item.data.ups} upvotes`,
    },
  }))
})
```

#### 步骤 3: 生成并测试

```bash
# 生成配置
npm run presource

# 启动开发服务器测试
npm run dev
```

---

## 🏗️ 项目结构

```
newsnow/
├── .specs/                 # 功能规格说明 (建议创建)
├── server/
│   ├── api/               # API 路由
│   ├── sources/           # 新闻源获取器 ⭐ 主要扩展点
│   ├── database/          # 数据库操作
│   └── utils/             # 服务端工具函数
├── shared/
│   ├── pre-sources.ts     # 源定义配置 ⭐ 注册新源
│   └── metadata.ts        # 分类元数据
├── src/
│   ├── routes/            # 前端路由
│   ├── components/        # React 组件
│   └── stores/            # Jotai 状态管理
├── scripts/
│   ├── source.ts          # 生成 sources.json
│   └── favicon.ts         # 生成 favicons
└── .env.server            # 环境变量配置
```

---

## 🛠️ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (带热重载) |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 (端口 4444) |
| `npm run presource` | 生成 source 定义和 favicons |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | ESLint 代码检查 |
| `npm run test` | 运行单元测试 |

---

## 🐳 Docker 部署

### 本地 SQLite 部署

```bash
docker compose -f docker-compose.local.yml up -d
```

### 生产环境部署

```bash
# 构建镜像
docker build -t newsnow:latest .

# 运行容器
docker run -d \
  -p 4444:4444 \
  -e G_CLIENT_ID=xxx \
  -e G_CLIENT_SECRET=xxx \
  -e JWT_SECRET=xxx \
  --name newsnow \
  newsnow:latest
```

---

## ☁️ 多平台部署

**📖 详细部署指南**: 查看 [DEPLOYMENT.zh-CN.md](./DEPLOYMENT.zh-CN.md)

### 快速部署方案

| 平台 | 推荐度 | 说明 |
|------|--------|------|
| **Cloudflare Pages** | ⭐⭐⭐⭐⭐ | 免费 + 完整功能 + D1 数据库 |
| **GitHub Pages** | ⭐⭐ | 免费，但仅静态页面（功能受限）|
| **Vercel** | ⭐⭐⭐⭐ | 免费额度，需自建数据库 |
| **Docker** | ⭐⭐⭐⭐ | 自建服务器，完全控制 |

### GitHub Pages (已配置)

项目已包含自动部署工作流:
- 推送到 `main` 分支自动部署
- 访问地址: `https://你的用户名.github.io/newsnow/`
- ⚠️ 仅支持静态展示，无法获取实时新闻

### Cloudflare Pages (推荐)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create** → **Connect to Git**
3. 选择仓库并配置:
   - Build command: `npm run build`
   - Build output: `dist/output/public`
   - Environment variable: `CF_PAGES=1`
4. 部署

### Docker 快速部署

```bash
# 使用本地 SQLite
docker compose -f docker-compose.local.yml up -d

# 访问 http://localhost:4444
```

---

## 📝 开发规范

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(source): add new news source
fix(api): correct data parsing error
chore: update dependencies
docs: improve setup guide
```

### 代码规范

项目已配置:
- **ESLint**: 自动代码检查
- **TypeScript**: 严格模式
- **Prettier**: 代码格式化 (通过 ESLint 集成)
- **Git Hooks**: 提交前自动运行 lint-staged

---

## 🔧 故障排除

### 问题: 类型定义找不到

**解决方案**: 运行构建生成类型文件
```bash
npm run build
```

### 问题: 端口被占用

**解决方案**: 修改端口或关闭占用进程
```bash
# 查找占用端口的进程
lsof -i :5173
# 或修改 vite.config.ts 中的端口配置
```

### 问题: pnpm 安装失败

**解决方案**: 清理缓存重试
```bash
pnpm store prune
pnpm install --force
```

---

## 📚 参考资源

- [Nitro 文档](https://nitro.unjs.io/)
- [React Router (TanStack)](https://tanstack.com/router)
- [Jotai 状态管理](https://jotai.org/)
- [UnoCSS 原子化 CSS](https://unocss.dev/)
- [原始项目 CONTRIBUTING](./CONTRIBUTING.md)

---

## 🎯 下一步计划

建议的迭代方向:

1. ✅ **项目初始化** - 已完成
2. 🔄 **添加自定义新闻源** - 按需添加感兴趣的源
3. 🎨 **界面定制** - 调整主题色、布局等
4. 🌐 **国际化** - 添加英文新闻源
5. 📊 **数据分析** - 添加阅读统计、趋势分析
6. 🔔 **通知功能** - 重要新闻推送
7. 🤖 **AI 集成** - 使用 MCP 进行智能摘要

---

**最后更新**: 2025-11-09
**维护者**: Fork from ourongxing/newsnow
