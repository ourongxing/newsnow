# NewsNow

![](screenshots/preview-1.png)

![](screenshots/preview-2.png)

[English](./README.md) | 简体中文 | [日本語](./README.ja-JP.md)

***优雅地阅读实时热门新闻***

> [!NOTE]
> 这个项目只是一个 demo，只支持中文，之后会发布一个正式版，可以更好的自定义，同时添加更多的英文内容。
>
## 特性
- 优雅的设计，优雅的阅读体验，时刻关注最新最热的新闻。
- 支持 Github 登录，支持数据同步。
- 默认 30 分钟缓存，登录用户可以强制拉取最新数据。但也会根据内容源的更新间隔设置不同的爬虫间隔时间（最快两分钟），节约资源的同时避免频繁爬取而导致 IP 封禁。

## 部署

如果不需要登录，缓存，可以直接部署到 Cloudflare Pages，Vercel 等。Fork 之后在对应平台上导入即可。

Cloudflare Pages 需要填入构建命令 `pnpm run build`, 构建输出文件夹 `dist/output/public`。

登录涉及到 Github Oauth，只需要 [创建一个 Github App](https://github.com/settings/applications/new) 即可，不需要申请任何权限。Callback URL 为 `https://your-domain.com/api/oauth/github`。

然后就会得到 Client ID 和 Client Secret。关于环境变量，不同平台有不同的填写位置，请关注 `example.env.server` 文件。如果本地运行，需要将其重命名为 `.env.server`，然后按照要求添加。

```env
# Github Clien ID
G_CLIENT_ID=
# Github Clien Secret
G_CLIENT_SECRET=
# JWT Secret, 通常就用 Clien Secret
JWT_SECRET=
# 初始化数据库, 首次运行必须设置为 true，之后可以将其关闭
INIT_TABLE=true
# 是否启用缓存
ENABLE_CACHE=true
```

本项目主推 Cloudflare Pages 以及 Docker 部署， Vercel 需要你自行搞定数据库，其他支持的数据库可以查看 https://db0.unjs.io/connectors 。

Cloudflare D1 数据库可以免费使用，在 Cloudflare Worker 控制面板里找到 D1 手动创建数据库，将 `database_id` 以及 `database_name` 填入 `wrangler.toml` 对应位置即可。没有 `wrangler.toml` 文件，可以把 `example.wrangler.toml` 重命名为 `wrangler.toml`, 将其修改为自己的配置，下次部署时就可以生效了。

对于 Docker 部署，只需要项目根目录 `docker-compose.yaml` 文件，同一目录下执行
```
docker compose up
```

## 开发
> [!TIP]
> node version >= 20

```bash
corepack enable
pnpm i
pnpm dev
```

你可能想要添加数据源，请关注 `shared/sources` `server/sources`，项目类型完备，结构简单，请自行探索。

## License

[MIT](./LICENSE) © ourongxing

## 赞赏
如果本项目对你有所帮助，可以给小猫买点零食。如果需要定制或者其他帮助，请通过下列方式联系备注。

![](./screenshots/reward.gif)
