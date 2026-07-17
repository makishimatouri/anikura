# 新对话交接模板

把下面内容和仓库中的 `AGENTS.md`、`docs/PROJECT_GUIDE.md` 一起交给新的 Agent。不要把 `.env.local`、Supabase key、个人账号或后台截图中的敏感信息附上。

```text
这是 cnanikura 项目。请先读取：
1. AGENTS.md
2. docs/INDEX.md
3. docs/PROJECT_GUIDE.md
4. 与本轮任务相关的 docs/OPERATIONS.md、docs/ARCHITECTURE.md、docs/DEPLOYMENT.md、docs/METHODS.md、docs/VERSIONING.md、docs/MAINTENANCE.md

先执行：
- git rev-parse --show-toplevel
- git status --short --branch
- git remote -v

当前任务：
【在这里填写目标】

允许修改：
【在这里填写文件或范围】

禁止触碰：
生产 Supabase 数据/RLS、生产环境变量、Cloudflare DNS、GoDaddy Nameserver、Vercel 生产设置，除非我明确确认。

完成后必须按以下顺序输出：
- 已确认事实
- 基于资料的推断
- 待确认问题
- 完成和修改的文件
- 运行过的验证命令及每项结果
- 风险、回滚点和下一步

如果涉及计算，请逐项列出输入、公式、中间值、结果、单位精度和校验；不能只给总数。
```
