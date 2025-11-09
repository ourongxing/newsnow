# 添加 BestBlogs.dev 优质技术博客源

**状态**: 📝 待实现 | **优先级**: 高 | **类型**: 新功能

## 📋 概述

将 [BestBlogs.dev](https://www.bestblogs.dev/) 集成到 NewsNow 作为优质技术内容源。BestBlogs.dev 是一个非盈利技术内容聚合平台，使用 AI 从 400+ 全球来源精选优质技术内容，包含软件编程、人工智能、产品设计、商业科技等领域。

## 🎯 目标

- ✅ 集成 BestBlogs.dev 的 RSS feed 作为新闻源
- ✅ 显示 AI 评分和摘要信息
- ✅ 支持多分类展示（编程、AI、产品、商业）
- ✅ 展示文章来源、作者、阅读时间等元数据
- ✅ 归类到"科技"分类

## 📐 设计方案

### 数据源信息

- **RSS Feed**: `https://www.bestblogs.dev/feeds/rss`
- **格式**: RSS 2.0 标准格式
- **更新频率**: 每日更新
- **内容特点**:
  - 包含 AI 评分（0-100 分）
  - 结构化摘要（一句话摘要 + 详细摘要 + 关键要点）
  - 多语言标签和分类
  - 封面图片

### RSS Feed 数据结构

```xml
<item>
  <title>文章标题</title>
  <link>原文链接</link>
  <guid>唯一标识符</guid>
  <pubDate>发布时间</pubDate>
  <author>作者名</author>
  <category>分类（软件编程/AI/产品设计/商业科技）</category>
  <description>HTML格式的详细描述</description>
  <keywords>关键词1, 关键词2</keywords>
  <score>AI评分（0-100）</score>
  <enclosure url="封面图片" type="image/jpeg"/>
</item>
```

### 实现步骤

#### 1. 注册源定义

**文件**: `/shared/pre-sources.ts`

```typescript
export const preSources = {
  // ... 其他源
  bestblogs: {
    type: "bestblogs",
    name: "BestBlogs",
    color: "#3B82F6", // 蓝色，代表技术
    home: "https://www.bestblogs.dev",
    interval: 1800, // 30分钟
    categories: ["tech"],
  },
} as const satisfies Record<string, PreSource>
```

#### 2. 实现 RSS 获取器

**文件**: `/server/sources/bestblogs.ts`

```typescript
export default defineSource(async () => {
  const url = "https://www.bestblogs.dev/feeds/rss"

  const data = await rss2json(url)

  return data.items.map(item => ({
    id: item.guid || item.link,
    title: item.title,
    url: item.link,
    pubDate: parseRelativeDate(item.pubDate).valueOf(),
    extra: {
      info: item.author || "BestBlogs",
      hover: extractScore(item), // 显示 AI 评分
      icon: item.enclosure?.url, // 文章封面
    },
  }))
})

// 辅助函数：从描述中提取 AI 评分
function extractScore(item: any): string {
  // 从 description 或自定义字段提取评分
  const score = item.score || extractScoreFromDescription(item.description)
  return score ? `AI评分: ${score}/100` : ""
}
```

**注意**: 需要解析 RSS 的自定义字段（如 `<score>`），可能需要在 `rss2json` 工具中增强支持。

#### 3. 生成配置

```bash
npm run presource
```

#### 4. 测试验证

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# 切换到"科技"分类验证显示
```

### 文件修改清单

- [ ] `/shared/pre-sources.ts` - 添加 bestblogs 源定义
- [ ] `/server/sources/bestblogs.ts` - 实现 RSS 数据获取逻辑
- [ ] `/server/utils/rss2json.ts` (可选) - 增强 RSS 解析，支持自定义字段
- [ ] 运行 `npm run presource` - 生成配置

## 🧪 测试计划

### 功能测试

1. **RSS 解析**
   - [ ] 成功获取 RSS feed
   - [ ] 正确解析标题、链接、时间
   - [ ] 正确提取 AI 评分
   - [ ] 正确解析作者信息
   - [ ] 封面图片正常显示

2. **显示效果**
   - [ ] 新闻列表正常显示
   - [ ] AI 评分信息正确展示
   - [ ] 点击标题跳转到原文
   - [ ] 时间显示正确（相对时间）
   - [ ] BestBlogs 图标正常显示

3. **性能测试**
   - [ ] RSS 解析时间 < 2秒
   - [ ] 缓存机制正常工作（30分钟）
   - [ ] 并发请求不会导致问题

### 边界情况

- [ ] RSS feed 暂时不可用时的错误处理
- [ ] 某些文章缺少字段时的容错处理
- [ ] 特殊字符和多语言内容的正确显示

## ⚠️ 注意事项

1. **自定义字段解析**: RSS feed 包含自定义字段（如 `<score>`, `<keywords>`），需要确保 `rss2json` 工具能正确解析
2. **HTML 描述**: description 字段是 HTML 格式，如果要显示摘要需要提取纯文本
3. **图片处理**: 封面图片可能需要通过代理服务加载（使用 `/api/proxy/img.png`）
4. **速率限制**: 虽然是公开 RSS，但建议使用合理的缓存时间（30分钟）
5. **内容许可**: BestBlogs.dev 是非盈利平台，内容聚合需遵守其使用条款

## 📅 时间线

- 预计开始: 2025-11-09
- 预计完成: 2025-11-09 (约1小时)

## ✅ 完成标准

- [ ] 源定义已注册到 pre-sources.ts
- [ ] RSS 获取器正确实现并返回数据
- [ ] AI 评分信息正确显示
- [ ] npm run presource 成功执行
- [ ] 开发服务器中能看到 BestBlogs 内容
- [ ] 代码通过 typecheck
- [ ] 代码通过 lint
- [ ] 提交代码到 git

## 📚 参考资料

- [BestBlogs.dev 官网](https://www.bestblogs.dev/)
- [BestBlogs RSS Feed](https://www.bestblogs.dev/feeds/rss)
- [RSS 2.0 规范](https://www.rssboard.org/rss-specification)
- [NewsNow rss2json 工具](../server/utils/rss2json.ts)

---

## 💡 未来增强

1. **分类细化**: 区分软件编程、AI、产品、商业等子分类
2. **评分过滤**: 支持只显示高分文章（如评分 > 80）
3. **关键词展示**: 显示文章的关键标签
4. **摘要预览**: 鼠标悬停时显示 AI 生成的摘要
5. **来源筛选**: 支持按原始来源（如 OpenAI、Google 等）筛选

---

**创建时间**: 2025-11-09
**创建者**: Claude
**估算工作量**: 1-2 小时
