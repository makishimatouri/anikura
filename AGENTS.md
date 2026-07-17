# cnanikura Agent 工作指令

这份文件是 cnanikura 仓库的 Agent 行为约束。它约束执行方式，不替代项目当前状态；项目状态以 `docs/PROJECT_GUIDE.md` 和当前代码为准。

## 1. 接手项目时的读取顺序

每次开启新对话或切换工作方向，先执行并阅读：

1. `git rev-parse --show-toplevel`、`git status --short --branch`、`git remote -v`，确认当前确实在 cnanikura 仓库。
2. `AGENTS.md`、`docs/INDEX.md`、`docs/PROJECT_GUIDE.md`。
3. 与任务直接相关的 `docs/ARCHITECTURE.md`、`docs/OPERATIONS.md`、`docs/DEPLOYMENT.md`、`docs/METHODS.md`、`docs/VERSIONING.md`、`docs/MAINTENANCE.md`。
4. `README.md`、`CHANGELOG.md`、相关源码和 Supabase migration。

旧会话、记忆、截图和聊天中的路径只能作为线索。当前文件、当前 Git 状态和本轮用户要求优先。如果仓库位置、版本号、线上状态或文档互相矛盾，先指出矛盾，再以当前证据为准。

## 2. 每次交付必须说明什么

最终回复或阶段性 handoff 至少要交代：

- **已确认事实**：来自当前文件、命令输出或可核验线上检查的内容。
- **基于资料的推断**：明确写出推断依据，不把推断写成事实。
- **待确认问题**：需要用户登录控制台、核对业务资料或做选择的内容。
- **本轮完成**：修改、创建或删除了哪些文件；没有改哪些高风险系统。
- **验证结果**：逐项列出运行过的命令及结果。没有运行就写“未运行”，不要用“应该通过”代替。
- **风险与下一步**：是否会触发生产部署、数据结构变化、DNS 变化、密钥变化或对外发布。

如果本轮没有计算，写明“本轮无数值计算”。如果有计算，必须按下一节输出，不能只给一个结论数字。

## 3. 计算和数据结论的固定格式

涉及数量、金额、比例、日期边界、文件大小、积分、库存、版本编号或其他可计算结论时，必须分别列出每个结果：

```text
计算目的：要回答什么问题
输入：每个输入值、来源、单位、时间点
公式：完整公式或筛选条件
中间值：逐步列出，不省略关键转换
结果：结果 1 = ……；结果 2 = ……；总计 = ……
单位与精度：元/积分/字节/百分比等，说明四舍五入或截断方式
校验：反算、范围检查、样本对照或为什么无法校验
假设与待确认：时区、空值、重复记录、是否含税等
```

比例必须写分母；金额必须写币种和是否含税；时间必须写时区；文件大小要区分十进制 MB 和 MiB。不能凭感觉补齐缺失数据。示例计算必须标为“示例”，不能冒充线上真实结果。

## 4. 修改前的安全边界

### 可以直接做的低风险操作

- 阅读、搜索、整理仓库文件。
- 用 `apply_patch` 修改文档、注释和已经明确授权的代码。
- 在独立分支上进行可回滚的文档或代码修改。
- 运行 `npm run typecheck`、`npm run lint`、`npm run build`、`npm run check` 和不改变外部状态的线上探测。
- 在提交前检查暂存区，确认没有环境文件、密钥或本地缓存。

### 需要提前明确告知风险，且通常要用户确认的操作

- 向 `main` 推送会触发 Vercel 生产部署的提交。
- 执行或修改 Supabase migration、RLS policy、Auth 用户权限、Storage policy，尤其是删除或覆盖数据。
- 修改 Supabase、Vercel、Cloudflare、GoDaddy 的生产设置、环境变量、域名、Nameserver、SSL/TLS 或重定向。
- 轮换、复制、粘贴或记录任何密钥。
- 生产回滚、数据库恢复、清空数据、删除文件或改写 Git 历史。

这些操作前要先说明：会改什么、影响范围、最坏结果、备份或回滚方案、验证方法。没有必要时优先做预览部署、独立分支和只读检查。不要用 `git reset --hard`、`git checkout --`、删除 session 或直接 `rm` 作为常规修复手段。

## 5. cnanikura 的不可破坏约束

- 项目是 Anikura CN 二次元音乐活动聚合站，不要把 AniROX 的厂牌活动和第三方活动默认视为同一主办方。
- 公开活动查询必须保留 `review_status = "approved"`；`status`、`is_anirox`、`is_featured` 各自含义不能混用。
- `is_anirox: true` 需要海报、主办方资料或用户明确说明等证据；不能因为活动类型像 AniROX 就自行标记。
- 中文主办方名称、活动名称、时间、地点和链接属于业务事实，必须按当前资料原样记录；不确定时标记“待确认”。
- `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用，绝不能出现在浏览器、提交记录、截图、Issue、日志或文档正文中。
- 改数据库字段前要先确认线上 schema，写入仓库 migration，备份并验证；不能只改 TypeScript 类型。
- 海报和头图优先复用当前 Supabase Storage 结构；当前上传限制、目录和展示比例见 `docs/METHODS.md`。
- 日期计算必须说明时区。现有部分代码使用 UTC 的 `toISOString()` 截取日期，修正它属于代码变更，不能在文档里默默假设已经修好。
- 版本以 Git tag 和 GitHub Release 归档，GitHub Projects 不是版本文件仓库。现有 `v0.3.0` 是历史误命名，不得作为正式版本线继续递增。

## 6. 变更和交接习惯

先看 `git status`，保留用户已有修改；不要覆盖与本轮任务无关的改动。文档变化要同步更新索引或 README；用户可见变化要同步 `CHANGELOG.md`。每次交付都给出下一位 Agent 可以直接执行的最短入口，例如：

```text
先读 AGENTS.md、docs/PROJECT_GUIDE.md、docs/OPERATIONS.md。
本轮目标：……
禁止触碰：生产数据库、DNS、Vercel 环境变量。
完成后请按“事实 / 推断 / 待确认 / 文件 / 验证 / 风险”输出。
```
