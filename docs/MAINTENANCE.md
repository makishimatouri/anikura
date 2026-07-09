# 维护清单

## 每次开发前

```bash
git status --short --branch
git pull --ff-only
```

确认当前分支和远端一致，再开始修改。

## 每次提交前

```bash
npm run check
git status --short
```

重点检查：

- 没有提交 `.env.local`
- 没有提交 `.DS_Store`、`.venv`、`.next`、`node_modules`
- 没有把测试活动、真实隐私信息或密钥写进代码
- 用户可见变化已记录到 `CHANGELOG.md`

## Supabase 维护

- 修改表结构前先导出 SQL 备份
- 新增字段后同步更新 `lib/types.ts`
- 涉及管理员权限的变更要检查 RLS policy
- 发现密钥泄露时，立刻在 Supabase 轮换对应 key，并更新 Vercel 环境变量

## 内容运营

- 活动时间、地点、票务信息以主办方最终确认为准
- 未审核活动不要出现在公开页面
- AniROX 和第三方活动信息分开标记，避免用户误解主办关系
