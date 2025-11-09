# 解决 PR 检查失败问题

## 问题说明

你的 Pull Request 遇到 Vercel 检查失败：
```
Vercel — Authorization required to deploy.
```

**这不是代码问题**，只是部署检查失败。代码本身没有任何问题，可以安全合并。

---

## 快速解决方案

### ✅ 方案 1: 直接合并 PR (最简单)

1. 在 GitHub PR 页面找到底部的合并按钮区域
2. 点击 **Merge pull request** 旁边的下拉箭头 ▼
3. 选择 **Merge without waiting for requirements to be met**
4. 点击确认合并

**或者**，如果有管理员权限：
- 直接点击绿色的 **Merge pull request** 按钮
- GitHub 会提示 "Merging is blocked"，点击 **Merge without waiting for requirements**

---

### 🔧 方案 2: 移除 Vercel 集成 (一劳永逸)

如果你不打算使用 Vercel 部署：

1. 进入仓库首页
2. **Settings** (仓库设置)
3. 左侧菜单 → **Integrations** → **GitHub Apps**
4. 找到 **Vercel** 应用
5. 点击 **Configure**
6. 滚动到底部，点击 **Uninstall** 或 **Remove**

移除后，所有 PR 都不会再有 Vercel 检查。

---

### ⚙️ 方案 3: 修改分支保护规则

如果你想保留 Vercel 但不强制要求检查通过：

1. 仓库 **Settings** → **Branches**
2. 找到 **Branch protection rules**
3. 点击 **main** 分支的 **Edit** 按钮
4. 找到 **Require status checks to pass before merging**
5. 在状态检查列表中，**取消勾选** `Vercel` 或 `vercel`
6. 滚动到底部点击 **Save changes**

---

### 🚀 方案 4: 配置 Vercel (如果需要 Vercel 部署)

如果你确实想使用 Vercel 部署：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 登录/注册 Vercel 账号
3. 点击 **Add New** → **Project**
4. 导入你的 GitHub 仓库 `liangkaifeng/newsnow`
5. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist/output/public`
   - Environment Variables: `VERCEL=1`
6. 点击 **Deploy**

部署成功后，Vercel 检查就会通过。

---

## 推荐操作

**如果只是想合并 PR**:
- ✅ 使用 **方案 1** 直接合并

**如果不需要 Vercel**:
- ✅ 使用 **方案 2** 移除集成

**如果需要 Vercel 部署**:
- ✅ 使用 **方案 4** 配置 Vercel

---

## 为什么会出现这个问题？

1. **原项目配置了 Vercel**: 你 fork 的原项目 `ourongxing/newsnow` 配置了 Vercel 集成
2. **检查被继承**: Fork 后的仓库继承了这个检查要求
3. **没有授权**: 你的仓库没有授权 Vercel 访问，所以检查失败

这是 GitHub + Vercel 集成的常见问题，**不影响代码质量**。

---

## 其他部署方案

如果你不想用 Vercel，项目已配置好其他部署方案：

| 平台 | 说明 | 文档 |
|------|------|------|
| **Cloudflare Pages** | 推荐！免费 + 完整功能 | [DEPLOYMENT.zh-CN.md](./DEPLOYMENT.zh-CN.md) |
| **GitHub Pages** | 已配置自动部署 | 推送到 main 自动部署 |
| **Docker** | 完全控制 | `docker compose up` |

---

## 需要帮助？

如果以上方案都不能解决问题，请提供：
1. PR 链接
2. 报错截图
3. 你的权限级别（Owner/Admin/Write）

我会帮你进一步排查！
