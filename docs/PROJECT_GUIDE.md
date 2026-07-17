# cnanikura 项目指导与状态

## 状态快照

最后核对：2026-07-17，Asia/Shanghai。

以下内容以当前仓库、当前线上只读探测和项目已有记录为依据。线上控制台内部配置没有在本轮登录复核，涉及“历史确认”的部分不能替代控制台检查。

| 项目 | 当前记录 |
| --- | --- |
| GitHub 仓库 | `makishimatouri/anikura` |
| 远端协议 | SSH：`git@github.com:makishimatouri/anikura.git` |
| 默认分支 | `main` |
| 当前代码版本 | `package.json` 为 `0.1.54`，`main` 当前指向 tag `v0.1.54` |
| 技术栈 | Next.js 16 App Router、React 19、TypeScript、Tailwind CSS 4、Supabase |
| 线上域名 | `anikura.cn`、`www.anikura.cn` |
| 线上链路 | GoDaddy 注册域名，Cloudflare 提供权威 DNS/CDN/TLS，Vercel 承载应用，Supabase 承载数据、认证和图片存储 |

## 本轮验证结果

### 本地仓库

- 文档改造开始前，`main` 与 `origin/main` 一致，工作区没有未提交业务代码改动；本轮文档已提交在 `codex/docs-handoff`，`main` 未修改。
- `npm run check`：通过。
  - `typecheck`：通过。
  - `lint`：0 个 error，2 个 `<img>` 性能 warning。
  - `build`：通过；另有 Next.js 对 `middleware` 文件约定弃用的 warning。

### 线上只读探测

- `https://anikura.cn`：308 跳转到 `https://www.anikura.cn/`。
- `https://www.anikura.cn/`、`/events`、`/anirox`、`/contact`、`/about`、`/admin/login`：探测时返回 200。
- `https://www.anikura.cn/robots.txt`：探测时返回 200。
- `https://www.anikura.cn/sitemap.xml`：探测时返回 404，当前仍是明确待处理项。
- Cloudflare 权威 Nameserver：`lakas.ns.cloudflare.com`、`hadlee.ns.cloudflare.com`。

这些结果是某个时间点的可用性快照，不代表以后每次都无需复核。

## 已关闭或已归档的部分

### 产品和权限流程

- 已有首页、全国活动、活动详情、AniROX 专区、联系页、关于页。
- 已有登录注册、管理员后台、活动新增/编辑、审核、通知、用户权限、签到、积分、兑换入口。
- 公开活动查询在当前代码中使用 `review_status = "approved"`，并按 `status`、城市、类型和月份筛选。
- 普通管理员和超管的入口、精选推荐、AniROX 标记、抽奖配置、用户权限操作存在区分；改权限时要同时检查界面、服务端页面和 RLS。

### 图片和数据

- 活动主海报和可选横向头图使用 Supabase Storage 的 `posters` bucket；当前上传代码按 `posters/` 和 `headers/` 两个前缀存放。
- 活动详情页保留海报完整比例；横向卡片优先使用 `header_image_url`，没有时回退到 `poster_url`。
- `supabase/migrations/20260709_add_event_header_image.sql` 已纳入仓库，但该 migration 是否已经在生产 Supabase 项目执行，需要在控制台确认。

### 仓库和版本

- `v0.1.0` 是正式基线归档。
- `v0.1.1` 是仓库文档、检查和协作规范化版本。
- `v0.1.2` 至 `v0.1.54` 保留了功能、移动端和文案调整历史。
- `v0.3.0` 仍保留在 Git 历史中，但属于开发阶段误命名，不是正式版本线。
- `.github/workflows/ci.yml` 当前在 `main` 的 push 和 PR 上执行 `typecheck`、`lint`；本地发布门禁 `npm run check` 还包括 build，二者不要混为一谈。

## 当前待确认和待处理

### 优先级较高

1. **确认生产数据库 migration 状态**：代码依赖 `events.header_image_url`。在 Supabase SQL Editor 查询列是否存在；如果不存在，先备份，再执行仓库 SQL，最后用管理员表单验证上传和保存。不要直接在文档中把“文件存在”写成“线上已执行”。
2. **处理 `sitemap.xml` 404**：若网站需要搜索引擎收录，应补充 Next.js sitemap route 或静态文件，并在预览和生产分别验证；这属于代码发布，不在本轮文档改造中直接处理。
3. **确认生产 Vercel 环境变量**：至少核对 URL、anon key、service role key 是否分别配置在正确环境；不要把值复制到仓库或聊天。

### 中等优先级

4. **建立数据库 schema 基线**：当前仓库只有头图字段 migration，`events`、`profiles`、`checkins`、`point_transactions`、`rewards`、`redemptions`、`notifications` 的完整建表和 RLS 没有全部保存在仓库。以后改表前应先导出当前 schema/policy，再逐步补齐可复现 migration。
5. **复核首页演示回退**：`FeaturedCarousel` 在没有精选活动时会显示“演示数据”。这是当前代码的明确行为；是否允许生产长期显示需要产品决定，不要自行删掉或替换为真实活动。
6. **复核日期时区和月份筛选**：部分代码用 UTC 日期判断“今天”和“即将发生”，而业务时区是 Asia/Shanghai；修正会改变签到、活动展示边界，需单独测试并确认。
7. **评估 CI 是否增加 build**：本地 `npm run check` 会构建，GitHub CI 当前只做 typecheck/lint。增加 build 会提高 CI 时间和覆盖率，需评估 Vercel 已经会构建这一事实后再决定。
8. **处理维护性 warning**：两个页面仍使用原生 `<img>`；Next.js 提示 `middleware` 文件约定未来迁移到 `proxy`。这些不是本轮阻塞项，修改时应单独验证图片域名和认证行为。

### 尚未核对的外部状态

- GoDaddy 域名续费、自动续费、账户 2FA 和付款方式。
- Cloudflare 当前 DNS 记录、代理状态、SSL/TLS 模式和变更审计记录。
- Vercel 当前 Production Deployment、Preview/Production 环境变量和团队权限。
- GitHub `main` 是否启用分支保护、必需 CI 检查和 tag/release 权限。
- Supabase 当前套餐、自动备份/PITR、RLS policy、Storage policy 和 Storage 文件保留情况。

这些项目需要登录相应后台才能确认；没有确认前不要写成“已配置”或“已备份”。

## 已踩过的坑

- **工作区和实际仓库可能不是同一目录**：先用 `git rev-parse --show-toplevel` 和 `git remote -v` 判断，不要因为目录名字相似就复制或重建整个项目。
- **版本线曾出现 `v0.3.0` 误命名**：正式线从 `v0.1.0` 开始；不要删除历史 tag，也不要继续沿用错误版本号。
- **GitHub Projects 不是版本归档**：版本看 Git tags、Releases 和 commit；Projects 只适合任务管理。
- **Cloudflare 与 GoDaddy 的职责不同**：Nameserver 切到 Cloudflare 后，DNS 记录应在 Cloudflare 改；GoDaddy 仍负责域名注册和续费。两边同时改会造成排查混乱。
- **Vercel 的 DNS Change Recommended 不一定是故障**：要分开看域名验证、Cloudflare 代理和实际访问结果，不能只看一个提示。
- **公开页面不能只依赖前端隐藏**：审核状态和管理员角色必须在查询、服务端页面和 RLS 层一起确认。
- **Supabase 数据库备份不等于 Storage 图片备份**：数据库备份通常只保存对象元数据，海报文件要单独考虑保留和恢复策略。
- **头图字段需要先迁移再上线代码**：表单已经对缺字段报错，但不能把用户错误提示当作 migration 流程。
- **日期和随机结果不是固定事实**：签到积分、推荐活动和日期边界都可能随时间或随机数变化；报告里要写输入和计算过程。
- **主分支推送可能触发生产部署**：只改 Markdown 也可能触发 Vercel build。除非已经核对并接受影响，否则先走独立分支和预览。

## 下一位 Agent 的最短启动提示

```text
先读 AGENTS.md、docs/PROJECT_GUIDE.md、docs/OPERATIONS.md。
当前正式版本是 v0.1.54；不要把 v0.3.0 当作版本线。
先执行 git status --short --branch 和 npm run check。
本轮先做只读检查或独立分支修改，不碰 Supabase 数据、RLS、DNS、Vercel 环境变量。
完成后按“事实 / 推断 / 待确认 / 文件 / 验证 / 风险”输出；有计算时逐项列公式、输入、中间值和结果。
```
