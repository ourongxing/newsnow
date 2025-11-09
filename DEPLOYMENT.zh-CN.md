# NewsNow 部署指南

本文档提供多种部署方案，根据你的需求选择合适的平台。

---

## 📊 部署方案对比

| 平台 | 费用 | SSR支持 | API支持 | 数据库 | 推荐度 |
|------|------|---------|---------|--------|--------|
| **Cloudflare Pages** | 免费 | ✅ | ✅ | D1 (免费) | ⭐⭐⭐⭐⭐ |
| **Vercel** | 免费额度 | ✅ | ✅ | 需自建 | ⭐⭐⭐⭐ |
| **GitHub Pages** | 免费 | ❌ | ❌ | ❌ | ⭐⭐ (仅静态) |
| **自建服务器** | 按需 | ✅ | ✅ | SQLite | ⭐⭐⭐⭐ |

---

## 🚀 方案 1: Cloudflare Pages (推荐)

**最适合 NewsNow**，完全免费且支持全部功能。

### 前置要求

- Cloudflare 账号 (免费注册: https://dash.cloudflare.com/sign-up)
- GitHub 仓库已关联

### 部署步骤

#### 1. 在 Cloudflare 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 `newsnow` 仓库

#### 2. 配置构建设置

在构建设置页面填写：

| 配置项 | 值 |
|--------|---|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist/output/public` |
| **Root directory** | `/` |
| **Environment variables** | 见下方 |

#### 3. 设置环境变量

点击 **Add variable** 添加以下环境变量：

```
CF_PAGES=1
NODE_VERSION=20
G_CLIENT_ID=你的GitHub OAuth Client ID (可选)
G_CLIENT_SECRET=你的GitHub OAuth Client Secret (可选)
JWT_SECRET=你的JWT密钥 (可选,用于登录功能)
PRODUCTHUNT_API_TOKEN=你的Product Hunt Token (可选)
```

**注意**:
- `CF_PAGES=1` 必须设置，用于启用 Cloudflare Pages 模式
- GitHub OAuth 相关变量仅在需要登录功能时设置
- 回调 URL 设置为: `https://你的域名/api/oauth/callback`

#### 4. 配置 Cloudflare D1 数据库 (可选)

如果需要用户数据同步功能：

1. 在 Cloudflare Dashboard 创建 D1 数据库
2. 数据库名称: `NEWSNOW_DB`
3. 在 Pages 项目的 **Settings** → **Functions** → **D1 database bindings** 绑定数据库
4. Binding name: `NEWSNOW_DB`

#### 5. 部署

点击 **Save and Deploy**，Cloudflare 会自动：
1. 拉取代码
2. 安装依赖
3. 执行构建
4. 部署上线

**部署完成后**: 你会获得一个 `*.pages.dev` 域名

#### 6. 自定义域名 (可选)

1. 在 Pages 项目 → **Custom domains**
2. 添加你的域名
3. 按提示配置 DNS (Cloudflare 会自动配置)

### 命令行部署 (可选)

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署
wrangler pages deploy dist/output/public --project-name=newsnow
```

---

## 🌐 方案 2: GitHub Pages (纯静态)

**⚠️ 功能限制**:
- ❌ 不支持实时新闻获取 (无 API)
- ❌ 不支持用户登录
- ✅ 仅展示静态页面

### 启用 GitHub Pages

#### 自动部署 (已配置)

项目已包含 GitHub Actions 工作流，自动部署到 GitHub Pages。

**启用步骤**:

1. 进入 GitHub 仓库 **Settings** → **Pages**
2. **Source** 选择: `GitHub Actions`
3. 推送代码到 `main` 分支

**部署 URL**: `https://你的用户名.github.io/newsnow/`

#### 配置 Base URL (如果仓库名不是 newsnow)

如果你的仓库名不是 `newsnow`，需要修改 `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/你的仓库名/',  // 添加这行
  // ... 其他配置
})
```

### 手动部署

```bash
# 构建
npm run build

# 部署到 gh-pages 分支 (需要安装 gh-pages)
npm install -D gh-pages
npx gh-pages -d dist/output/public
```

---

## ☁️ 方案 3: Vercel

### 部署步骤

1. 访问 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/output/public`
4. 环境变量:
   ```
   VERCEL=1
   NODE_VERSION=20
   ```
5. 部署

**注意**: Vercel 默认使用 Edge Runtime，需要自行配置数据库（不支持 SQLite）。

---

## 🐳 方案 4: Docker 部署

### 使用 Docker Compose

```bash
# 克隆仓库
git clone https://github.com/你的用户名/newsnow.git
cd newsnow

# 复制环境变量
cp example.env.server .env.server
# 编辑 .env.server 填写配置

# 启动
docker compose up -d

# 使用本地 SQLite (推荐)
docker compose -f docker-compose.local.yml up -d
```

访问: http://localhost:4444

### 构建自定义镜像

```bash
# 构建
docker build -t newsnow:latest .

# 运行
docker run -d \
  -p 4444:4444 \
  -e G_CLIENT_ID=xxx \
  -e G_CLIENT_SECRET=xxx \
  -v $(pwd)/.data:/app/.data \
  --name newsnow \
  newsnow:latest
```

---

## 🖥️ 方案 5: Node.js 服务器

### 部署到 VPS/云服务器

#### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应该是 v20.x.x
```

#### 2. 部署应用

```bash
# 克隆代码
git clone https://github.com/你的用户名/newsnow.git
cd newsnow

# 安装依赖
corepack enable
pnpm install

# 配置环境变量
cp example.env.server .env.server
nano .env.server  # 编辑配置

# 构建
npm run build

# 启动 (开发模式)
npm run start

# 或使用 PM2 (生产环境)
npm install -g pm2
pm2 start "npm run start" --name newsnow
pm2 save
pm2 startup
```

#### 3. 配置 Nginx 反向代理 (可选)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/newsnow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 安装 SSL 证书 (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `G_CLIENT_ID` | 可选 | GitHub OAuth 客户端 ID | `Ov23liXXXXXXXXXX` |
| `G_CLIENT_SECRET` | 可选 | GitHub OAuth 密钥 | `xxx` |
| `JWT_SECRET` | 可选 | JWT 签名密钥 | 任意随机字符串 |
| `INIT_TABLE` | 可选 | 首次运行初始化数据库 | `true` |
| `ENABLE_CACHE` | 可选 | 启用缓存 | `true` |
| `PRODUCTHUNT_API_TOKEN` | 可选 | Product Hunt API Token | `xxx` |
| `CF_PAGES` | Cloudflare | 启用 Cloudflare Pages 模式 | `1` |
| `VERCEL` | Vercel | 启用 Vercel 模式 | `1` |
| `BUN` | Bun | 启用 Bun 运行时 | `1` |

---

## ❓ 常见问题

### 1. GitHub Pages 部署后无法获取新闻？

**原因**: GitHub Pages 只支持静态文件，不支持 API。

**解决方案**: 使用 Cloudflare Pages 或 Vercel。

### 2. Cloudflare D1 数据库如何初始化？

首次部署时自动初始化。或手动运行:

```bash
wrangler d1 execute NEWSNOW_DB --file=./server/database/schema.sql
```

### 3. 如何更新部署？

**Cloudflare Pages**: 推送到 GitHub，自动部署

**GitHub Pages**: 推送到 main 分支，自动部署

**Docker**:
```bash
docker compose down
git pull
docker compose up -d --build
```

### 4. 部署失败怎么办？

检查:
1. Node.js 版本是否 >= 20
2. 环境变量是否正确设置
3. 查看构建日志中的错误信息

---

## 📊 性能优化建议

### Cloudflare Pages

- 启用 **Auto Minify** (CSS, JS, HTML)
- 配置 **Caching Level**: Standard
- 启用 **Brotli** 压缩

### 自建服务器

- 使用 Nginx/Caddy 作为反向代理
- 启用 HTTP/2 和 Brotli 压缩
- 配置 CDN (Cloudflare CDN 免费)
- 使用 PM2 进程管理

---

## 🎯 推荐配置总结

**个人项目/测试**:
- ✅ **Cloudflare Pages** (免费 + 全功能)

**团队/商业项目**:
- ✅ **Vercel Pro** 或 **自建服务器**

**纯展示页面**:
- ✅ **GitHub Pages** (功能受限)

---

**最后更新**: 2025-11-09
**维护者**: Fork from ourongxing/newsnow
