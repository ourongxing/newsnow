# 示例: 添加 Hacker News 新闻源

**状态**: 📝 示例文档 | **类型**: 新功能

## 📋 概述

为 NewsNow 添加 Hacker News (HN) 作为新闻源,展示科技领域的热门话题和讨论。

## 🎯 目标

- 集成 Hacker News 的前30条热门新闻
- 显示标题、链接、评论数、点赞数
- 每15分钟自动更新一次
- 归类到"科技"分类下

## 📐 设计方案

### API 信息

- **API 地址**: `https://hacker-news.firebaseio.com/v0/topstories.json`
- **单条新闻**: `https://hacker-news.firebaseio.com/v0/item/{id}.json`
- **文档**: https://github.com/HackerNews/API

### 数据结构

```json
{
  "id": 12345,
  "title": "Show HN: My new project",
  "url": "https://example.com",
  "score": 123,
  "by": "username",
  "time": 1234567890,
  "descendants": 45
}
```

### 实现步骤

#### 1. 注册源定义

**文件**: `/shared/pre-sources.ts`

```typescript
export const preSources = {
  // ... 其他源
  hackernews: {
    type: "hackernews",
    name: "Hacker News",
    color: "#FF6600",
    home: "https://news.ycombinator.com",
    interval: 900, // 15分钟
    categories: ["tech"],
  },
} as const satisfies Record<string, PreSource>
```

#### 2. 实现获取器

**文件**: `/server/sources/hackernews.ts`

```typescript
export default defineSource(async () => {
  // 获取前30个热门故事ID
  const topStoryIds = await myFetch<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  )

  // 只取前30条
  const storyIds = topStoryIds.slice(0, 30)

  // 并发获取每条新闻详情
  const stories = await Promise.all(
    storyIds.map(id =>
      myFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    )
  )

  // 转换为 NewsItem 格式
  return stories
    .filter(story => story && story.url) // 过滤掉没有外链的讨论贴
    .map(story => ({
      id: story.id,
      title: story.title,
      url: story.url,
      pubDate: story.time * 1000, // 转换为毫秒
      extra: {
        info: `${story.score} points`,
        hover: `${story.descendants || 0} comments`,
      },
    }))
})
```

#### 3. 生成配置

```bash
npm run presource
```

#### 4. 测试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:5173
# 切换到"科技"分类
# 验证 Hacker News 源显示正常
```

### 文件修改清单

- [x] `/shared/pre-sources.ts` - 添加 hackernews 源定义
- [x] `/server/sources/hackernews.ts` - 实现数据获取逻辑
- [x] 运行 `npm run presource` - 生成 sources.json 和 pinyin.json

## 🧪 测试计划

### 功能测试

1. **数据获取**
   - [ ] 能够成功获取30条新闻
   - [ ] 每条新闻包含必需字段(id, title, url)
   - [ ] pubDate 时间戳正确

2. **显示效果**
   - [ ] 新闻列表正常显示
   - [ ] 点击标题能跳转到原文
   - [ ] 评论数和点赞数正确显示
   - [ ] 图标显示正确(HN 的橙色)

3. **错误处理**
   - [ ] API 请求失败时有适当提示
   - [ ] 网络超时时能正确处理
   - [ ] 数据格式异常时不崩溃

### 性能测试

- [ ] 30条新闻加载时间 < 3秒
- [ ] 缓存机制正常工作(15分钟内不重复请求)

## ⚠️ 注意事项

1. **API 限制**: HN API 没有明确的频率限制,但建议不要过于频繁请求
2. **缓存策略**: 使用15分钟缓存,避免给 HN 服务器造成压力
3. **错误处理**: HN API 偶尔会超时,需要有重试机制(已在 myFetch 中实现)
4. **数据过滤**: 过滤掉 Ask HN、Show HN 等纯讨论贴(没有 url 字段)

## 📅 时间线

- 预计开始: 2025-11-09
- 预计完成: 2025-11-09 (约30分钟)

## ✅ 完成标准

- [x] 源定义已注册到 pre-sources.ts
- [x] 获取器实现并返回正确格式数据
- [x] npm run presource 成功执行
- [x] 开发服务器中能看到 HN 新闻
- [x] 数据刷新机制正常工作
- [ ] 代码通过 typecheck
- [ ] 代码通过 lint
- [ ] 提交代码到 git

## 📚 参考资料

- [Hacker News API 文档](https://github.com/HackerNews/API)
- [NewsNow CONTRIBUTING.md](../CONTRIBUTING.md)
- [Nitro 文档 - defineEventHandler](https://nitro.unjs.io/guide/routing)

---

## 💡 扩展想法

未来可以考虑:

1. **分类细化**: 区分 Show HN、Ask HN 等不同类型
2. **评论集成**: 点击新闻时显示 HN 的热门评论
3. **用户主页**: 支持查看特定用户的提交
4. **算法优化**: 使用 Best Stories 或 New Stories API

---

**创建时间**: 2025-11-09
**创建者**: Claude (示例文档)
