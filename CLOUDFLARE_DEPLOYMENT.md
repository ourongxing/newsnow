# Cloudflare Pages 部署指南

本文档说明如何将 NewsNow 部署到你的 Cloudflare 账户（无需 GitHub OAuth 登录功能）。

## ✅ 已完成的配置

以下配置文件已经为你准备好：

1. **wrangler.toml** - Cloudflare Pages 配置文件
   - 已配置 D1 数据库 ID: `10bde3d1-2b9a-4c05-b54a-d4df6f0f54a1`
   - 数据库绑定名称: `NEWSNOW_DB`

2. **.env.server** - 本地开发环境变量（已禁用 GitHub OAuth）

## 📦 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **连接 Git 仓库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → **Create application** → **Pages**
   - 选择 **Connect to Git**
   - 授权并选择你的 `newsnow` 仓库

2. **配置构建设置**
   ```
   Framework preset: None
   Build command: pnpm run build
   Build output directory: dist/output/public
   Root directory: (留空)
   ```

3. **添加环境变量**

   在 **Settings** → **Environment variables** 中添加（Production 环境）：
   ```
   INIT_TABLE=true
   ENABLE_CACHE=true
   JWT_SECRET=your-random-secret-key-change-this
   ```

   > 注意：JWT_SECRET 请修改为一个随机字符串，用于加密用户会话

4. **绑定 D1 数据库**
   - 进入 **Settings** → **Functions** → **D1 database bindings**
   - 点击 **Add binding**
   - Variable name: `NEWSNOW_DB`
   - D1 database: 选择 `newsnow-db` (database_id: 10bde3d1-2b9a-4c05-b54a-d4df6f0f54a1)

5. **重新部署**
   - 配置完成后，在 **Deployments** 页面点击 **Retry deployment**

### 方法二：通过命令行部署

1. **安装依赖**
   ```bash
   corepack enable
   pnpm install
   ```

2. **登录 Cloudflare**
   ```bash
   pnpm wrangler login
   ```

3. **构建并部署**
   ```bash
   pnpm run deploy
   ```

4. **配置环境变量和 D1 绑定**
   - 命令行部署后，仍需要在 Dashboard 中配置环境变量和 D1 数据库绑定
   - 参考方法一的步骤 3 和 4

## 🔍 验证部署

1. 访问你的域名：`https://你的项目名.pages.dev`
2. 检查新闻源是否正常加载
3. 测试缓存和刷新功能

## 📝 注意事项

1. **首次部署**: 确保 `INIT_TABLE=true`，这会初始化数据库表结构
2. **后续部署**: 初始化完成后，可以将 `INIT_TABLE` 改为 `false` 以提高性能
3. **无登录功能**: 由于未配置 GitHub OAuth，用户登录和数据同步功能将不可用
4. **缓存设置**: 默认缓存 30 分钟，未登录用户无法强制刷新

## 🎯 自定义域名（可选）

如需绑定自定义域名：

1. 在 Cloudflare Pages 项目中选择 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名并按提示配置 DNS

## 🆘 常见问题

**Q: 部署后显示数据库错误？**
- 确认 D1 数据库绑定正确，Variable name 必须是 `NEWSNOW_DB`
- 确认 `INIT_TABLE=true` 已设置

**Q: 新闻源无法加载？**
- 检查 Cloudflare Pages 的 **Functions** 日志
- 确认环境变量配置正确

**Q: 如何查看日志？**
```bash
pnpm run log
```

## 📚 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
