---
name: verify
description: 运行 lint、类型检查和测试来验证代码变更是否正确
---

在提交代码前运行完整验证。按顺序执行以下命令，遇到错误时停下来修复:

1. `pnpm lint` — ESLint 检查
2. `pnpm typecheck` — TypeScript 类型检查
3. `pnpm test` — 运行 Vitest 测试

如果任何步骤失败，分析错误输出并修复问题，然后重新运行失败的步骤。全部通过后告知用户结果。
