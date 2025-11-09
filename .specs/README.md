# 功能规格说明目录

这个目录用于存放项目功能的规格说明文档,采用 **Spec-Driven Development** 方式进行开发。

## 📝 为什么使用 Spec Kit?

1. **明确目标**: 在编码前先明确功能需求和实现方案
2. **便于协作**: 团队成员可以清楚了解每个功能的设计意图
3. **文档驱动**: 规格说明本身就是最好的开发文档
4. **AI 友好**: Claude 等 AI 助手可以根据规格说明自动实现功能
5. **持续迭代**: 每次迭代都有清晰的规格记录

## 🎯 如何使用

### 1. 创建功能规格

为每个新功能创建一个 Markdown 文件:

```bash
.specs/
├── README.md              # 本文件
├── add-xxx-source.md      # 添加新闻源的规格
├── feature-xxx.md         # 新功能的规格
└── fix-xxx-bug.md         # Bug 修复的规格
```

### 2. 规格文件模板

```markdown
# [功能名称]

## 📋 概述
简要描述这个功能的目的和价值

## 🎯 目标
- 目标 1
- 目标 2

## 📐 设计方案

### 技术选型
- 使用的技术/库/框架

### 实现步骤
1. 步骤 1
2. 步骤 2
3. 步骤 3

### 文件修改清单
- [ ] `path/to/file1.ts` - 修改内容描述
- [ ] `path/to/file2.ts` - 修改内容描述

## 🧪 测试计划
- 测试场景 1
- 测试场景 2

## 📅 时间线
- 预计开始: YYYY-MM-DD
- 预计完成: YYYY-MM-DD

## ✅ 完成标准
- [ ] 功能正常运行
- [ ] 代码通过类型检查
- [ ] 代码通过 lint 检查
- [ ] 编写相关测试
- [ ] 更新相关文档

## 📚 参考资料
- 相关链接 1
- 相关链接 2
```

### 3. 使用 Claude 实现功能

直接告诉 Claude:

> "请根据 `.specs/add-xxx-source.md` 的规格说明实现这个功能"

Claude 会:
1. 读取规格文件
2. 理解需求和设计
3. 按照步骤实现
4. 运行测试验证
5. 提交代码

### 4. 完成后更新状态

在规格文件开头添加状态标签:

```markdown
# [功能名称]

**状态**: ✅ 已完成 | 📅 实现日期: 2025-11-09 | 👤 实现者: Claude

## 📋 概述
...
```

## 📚 当前规格文档

### 🚀 待实现功能

| 规格文档 | 优先级 | 工作量 | 说明 |
|---------|--------|--------|------|
| [add-bestblogs-dev-source.md](./add-bestblogs-dev-source.md) | 高 | 1-2h | 添加 BestBlogs.dev AI精选技术博客源 |
| [add-crypto-news-sources.md](./add-crypto-news-sources.md) | 高 | 6-8h | 添加中英文币圈新闻聚合功能 |

### 📋 规格总览

查看 [ROADMAP.md](./ROADMAP.md) 了解完整的功能路线图和实施计划。

### 📖 示例文档

| 文档 | 说明 |
|------|------|
| [example-add-news-source.md](./example-add-news-source.md) | 添加 Hacker News 源的完整示例 |

## 🚀 快速开始

### 实现已有规格

选择一个规格文档，告诉 Claude:

```
请实现 .specs/add-bestblogs-dev-source.md 中的功能
```

### 创建新规格

告诉 Claude 你的需求:

```
我想添加 Reddit 作为新闻源，请帮我创建规格文档
```

## 🔄 工作流程

```
1. 创建规格 (.specs/xxx.md)
     ↓
2. 评审规格 (团队讨论)
     ↓
3. 实现功能 (开发/AI辅助)
     ↓
4. 测试验证 (npm run test/dev)
     ↓
5. 代码审查 (git commit)
     ↓
6. 部署上线 (npm run build)
     ↓
7. 更新状态 (标记完成)
```

---

**提示**: 使用 Claude Code 时,可以直接说 "帮我为添加 XXX 功能创建一个规格文档",Claude 会自动生成规格文件。
