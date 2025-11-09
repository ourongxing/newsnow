# 添加加密货币/币圈新闻聚合功能

**状态**: 📝 待实现 | **优先级**: 高 | **类型**: 新功能

## 📋 概述

为 NewsNow 添加中英文主流加密货币新闻源，覆盖全球前几名的币圈资讯平台，包括：
- **英文源**: CoinDesk, Cointelegraph, Decrypt, CryptoPanic
- **中文源**: 金色财经, BlockBeats (律动), 巴比特

这些新闻源将帮助用户快速了解加密货币市场动态、政策法规、技术发展等信息。

## 🎯 目标

- ✅ 集成 4+ 个英文主流币圈新闻源
- ✅ 集成 3+ 个中文主流币圈新闻源
- ✅ 创建独立的"加密货币"分类
- ✅ 显示币价变动、市值等关键信息（如果源提供）
- ✅ 支持中英文混合显示
- ✅ 每15-30分钟更新一次

## 📐 设计方案

### 新增分类

在 `/shared/metadata.ts` 添加新分类：

```typescript
export const metadata = {
  // ... 现有分类
  crypto: {
    name: "加密货币",
    sources: [
      "coindesk",
      "cointelegraph",
      "decrypt",
      "cryptopanic",
      "jinse",
      "blockbeats",
      "8btc",
    ],
  },
} as const satisfies Metadata
```

### 数据源详细信息

#### 英文源

| 源名称 | RSS/API | 更新频率 | 特点 |
|--------|---------|----------|------|
| **CoinDesk** | RSS: `https://www.coindesk.com/arc/outboundfeeds/rss/` | 实时 | 最权威的加密货币新闻，行业标准 |
| **Cointelegraph** | RSS: `https://cointelegraph.com/rss` | 实时 | 全球最大的区块链媒体之一 |
| **Decrypt** | RSS: `https://decrypt.co/feed` | 每小时 | Web3 和加密文化报道 |
| **CryptoPanic** | API: 需要注册 | 实时 | 新闻聚合，包含社交媒体 |

#### 中文源

| 源名称 | RSS/API | 更新频率 | 特点 |
|--------|---------|----------|------|
| **金色财经** | 网页抓取 | 实时 | 中国最大的区块链媒体 |
| **BlockBeats** | 网页抓取 | 实时 | 专业的区块链研究机构 |
| **巴比特** | RSS: 需要查找 | 每小时 | 老牌中文区块链社区 |

### 实现步骤

#### 阶段 1: 英文 RSS 源（优先）

##### 1.1 CoinDesk

**文件**: `/server/sources/coindesk.ts`

```typescript
export default defineSource(async () => {
  const url = "https://www.coindesk.com/arc/outboundfeeds/rss/"

  const data = await rss2json(url)

  return data.items.slice(0, 30).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    url: item.link,
    pubDate: parseRelativeDate(item.pubDate).valueOf(),
    extra: {
      info: "CoinDesk",
    },
  }))
})
```

**源定义**: `/shared/pre-sources.ts`

```typescript
coindesk: {
  type: "coindesk",
  name: "CoinDesk",
  color: "#FFA500", // 橙色
  home: "https://www.coindesk.com",
  interval: 900, // 15分钟
  categories: ["crypto"],
},
```

##### 1.2 Cointelegraph

**文件**: `/server/sources/cointelegraph.ts`

```typescript
export default defineSource(async () => {
  const url = "https://cointelegraph.com/rss"

  const data = await rss2json(url)

  return data.items.slice(0, 30).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    url: item.link,
    pubDate: parseRelativeDate(item.pubDate).valueOf(),
    extra: {
      info: "Cointelegraph",
    },
  }))
})
```

**源定义**:

```typescript
cointelegraph: {
  type: "cointelegraph",
  name: "Cointelegraph",
  color: "#00D4AA", // 青色
  home: "https://cointelegraph.com",
  interval: 900,
  categories: ["crypto"],
},
```

##### 1.3 Decrypt

**文件**: `/server/sources/decrypt.ts`

```typescript
export default defineSource(async () => {
  const url = "https://decrypt.co/feed"

  const data = await rss2json(url)

  return data.items.slice(0, 30).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    url: item.link,
    pubDate: parseRelativeDate(item.pubDate).valueOf(),
    extra: {
      info: "Decrypt",
    },
  }))
})
```

**源定义**:

```typescript
decrypt: {
  type: "decrypt",
  name: "Decrypt",
  color: "#6366F1", // 紫色
  home: "https://decrypt.co",
  interval: 1800, // 30分钟
  categories: ["crypto"],
},
```

#### 阶段 2: 中文源（网页抓取）

##### 2.1 金色财经 (Jinse Finance)

**文件**: `/server/sources/jinse.ts`

```typescript
export default defineSource(async () => {
  // 金色财经快讯 API (可能需要逆向工程)
  // 或者抓取首页新闻列表
  const url = "https://api.jinse.cn/noah/v2/lives"

  const response = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  })

  const data = response.list || []

  return data.slice(0, 30).map((item: any) => ({
    id: item.id,
    title: item.content,
    url: `https://www.jinse.cn/lives/${item.id}.html`,
    pubDate: item.created_at * 1000,
    extra: {
      info: "金色财经",
    },
  }))
})
```

**源定义**:

```typescript
jinse: {
  type: "jinse",
  name: "金色财经",
  color: "#FFD700", // 金色
  home: "https://www.jinse.cn",
  interval: 600, // 10分钟（快讯更新快）
  categories: ["crypto"],
},
```

**注意**: 金色财经可能需要分析网站 API 或进行网页抓取。

##### 2.2 BlockBeats (律动)

**文件**: `/server/sources/blockbeats.ts`

```typescript
export default defineSource(async () => {
  // BlockBeats 新闻列表 API（需要分析）
  const url = "https://www.theblockbeats.info/api/v1/articles"

  const response = await myFetch(url)

  return response.data.slice(0, 30).map((item: any) => ({
    id: item.id,
    title: item.title,
    url: `https://www.theblockbeats.info/news/${item.id}`,
    pubDate: new Date(item.published_at).valueOf(),
    extra: {
      info: "BlockBeats",
    },
  }))
})
```

**源定义**:

```typescript
blockbeats: {
  type: "blockbeats",
  name: "BlockBeats",
  color: "#1E90FF", // 蓝色
  home: "https://www.theblockbeats.info",
  interval: 900, // 15分钟
  categories: ["crypto"],
},
```

##### 2.3 巴比特 (8btc)

**文件**: `/server/sources/babit.ts`

```typescript
export default defineSource(async () => {
  // 尝试使用 RSS 或网页抓取
  const url = "https://www.8btc.com/feed" // 需要验证

  const data = await rss2json(url)

  return data.items.slice(0, 30).map(item => ({
    id: item.guid || item.link,
    title: item.title,
    url: item.link,
    pubDate: parseRelativeDate(item.pubDate).valueOf(),
    extra: {
      info: "巴比特",
    },
  }))
})
```

**源定义**:

```typescript
babit: {
  type: "babit",
  name: "巴比特",
  color: "#FF6B6B", // 红色
  home: "https://www.8btc.com",
  interval: 1800, // 30分钟
  categories: ["crypto"],
},
```

#### 阶段 3: 元数据配置

**文件**: `/shared/metadata.ts`

```typescript
export const metadata = {
  // ... 现有分类
  crypto: {
    name: "加密货币",
    sources: [
      "coindesk",
      "cointelegraph",
      "decrypt",
      "jinse",
      "blockbeats",
      "babit",
    ] as SourceID[],
  },
} as const satisfies Metadata
```

### 文件修改清单

#### 英文源 (阶段 1)
- [ ] `/shared/pre-sources.ts` - 添加 coindesk, cointelegraph, decrypt 源定义
- [ ] `/server/sources/coindesk.ts` - 实现 CoinDesk RSS 获取
- [ ] `/server/sources/cointelegraph.ts` - 实现 Cointelegraph RSS 获取
- [ ] `/server/sources/decrypt.ts` - 实现 Decrypt RSS 获取

#### 中文源 (阶段 2)
- [ ] `/server/sources/jinse.ts` - 实现金色财经数据获取（需要 API 分析）
- [ ] `/server/sources/blockbeats.ts` - 实现 BlockBeats 数据获取（需要 API 分析）
- [ ] `/server/sources/babit.ts` - 实现巴比特数据获取

#### 元数据配置
- [ ] `/shared/metadata.ts` - 添加 crypto 分类

#### 生成和测试
- [ ] 运行 `npm run presource` - 生成配置
- [ ] 测试所有源的数据获取

## 🧪 测试计划

### 功能测试

1. **RSS 源测试 (英文)**
   - [ ] CoinDesk RSS 正常解析
   - [ ] Cointelegraph RSS 正常解析
   - [ ] Decrypt RSS 正常解析
   - [ ] 时间格式正确转换

2. **API/抓取测试 (中文)**
   - [ ] 金色财经 API/抓取成功
   - [ ] BlockBeats API/抓取成功
   - [ ] 巴比特数据获取成功
   - [ ] 中文字符正确显示

3. **分类显示**
   - [ ] "加密货币"分类出现在导航栏
   - [ ] 所有币圈源正确归类
   - [ ] 中英文内容混合显示正常

4. **性能测试**
   - [ ] 单个源加载时间 < 3秒
   - [ ] 7个源并发加载不超时
   - [ ] 缓存机制正常工作

### 错误处理

- [ ] 某个源失败不影响其他源
- [ ] 网络超时有适当重试
- [ ] API 限流时有错误提示
- [ ] 数据格式异常时不崩溃

## ⚠️ 注意事项

### 1. API 访问限制
- 金色财经、BlockBeats 可能需要逆向工程分析 API
- 部分网站可能有反爬虫机制，需要添加适当的 User-Agent 和延迟
- 建议使用合理的缓存时间，避免频繁请求

### 2. 数据合规性
- 确保遵守各网站的使用条款和 robots.txt
- 不要过度抓取造成服务器压力
- 保留原文链接，尊重内容版权

### 3. 内容过滤
- 币圈新闻可能包含投资建议，需要添加免责声明
- 过滤垃圾信息和广告内容
- 注意虚假信息和诈骗内容

### 4. 技术挑战
- 中文网站可能需要处理字符编码问题
- 某些网站使用动态加载（需要分析 API 或使用 headless browser）
- API 格式可能随时变化，需要定期维护

## 📅 时间线

### 阶段 1: 英文 RSS 源
- 预计开始: 2025-11-09
- 预计完成: 2025-11-09 (约2小时)

### 阶段 2: 中文源
- 预计开始: 2025-11-09
- 预计完成: 2025-11-10 (约4小时，需要 API 分析)

### 阶段 3: 测试和优化
- 预计完成: 2025-11-10

## ✅ 完成标准

### 阶段 1 完成标准
- [ ] 3个英文源全部实现并测试通过
- [ ] "加密货币"分类显示正常
- [ ] RSS 解析正确，数据完整
- [ ] 代码通过 typecheck 和 lint

### 阶段 2 完成标准
- [ ] 至少2个中文源成功实现
- [ ] 中英文混合显示正常
- [ ] 中文字符无乱码

### 最终完成标准
- [ ] 所有源定义已注册
- [ ] 至少5个源正常工作
- [ ] 缓存和错误处理完善
- [ ] 提交代码到 git
- [ ] 更新文档

## 📚 参考资料

### RSS Feeds
- [CoinDesk RSS](https://www.coindesk.com/arc/outboundfeeds/rss/)
- [Cointelegraph RSS](https://cointelegraph.com/rss)
- [Decrypt RSS](https://decrypt.co/feed)

### 中文源
- [金色财经](https://www.jinse.cn/)
- [BlockBeats](https://www.theblockbeats.info/)
- [巴比特](https://www.8btc.com/)

### API 文档
- [CryptoNews API](https://cryptonews-api.com/) - 付费 API 备选方案
- [CryptoPanic API](https://cryptopanic.com/developers/api/) - 需要注册

---

## 💡 未来增强

1. **币价集成**: 集成 CoinGecko API 显示实时币价
2. **情绪分析**: 使用 AI 分析新闻情绪（牛市/熊市）
3. **关键词高亮**: 高亮显示 BTC、ETH 等热门币种
4. **推送通知**: 重大新闻推送通知
5. **社交媒体**: 集成 Twitter/X 上的币圈 KOL 动态
6. **数据可视化**: 添加币价走势图和市值排行
7. **个性化**: 支持用户订阅特定币种的新闻

---

## 🎯 实现优先级

**P0 (必须)**:
- ✅ CoinDesk (英文权威源)
- ✅ 金色财经 (中文权威源)

**P1 (重要)**:
- ✅ Cointelegraph
- ✅ BlockBeats

**P2 (可选)**:
- ✅ Decrypt
- ✅ 巴比特

**P3 (增强)**:
- CryptoPanic (需要 API key)
- 更多小众但优质的源

---

**创建时间**: 2025-11-09
**创建者**: Claude
**估算工作量**: 阶段1: 2小时 | 阶段2: 4小时 | 总计: 6-8小时
**风险评估**: 中等（中文源需要 API 分析，可能需要额外时间）
