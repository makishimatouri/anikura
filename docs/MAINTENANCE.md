# 维护清单

这份清单用于日常维护和发布前自检。每次完成阶段性工作后，把已完成项目归档到 `docs/PROJECT_GUIDE.md`，不要让代办列表无限堆积。

## 每次开始工作

```bash
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git fetch origin
git log --oneline --decorate -12
```

确认当前分支、远端、工作区和用户已有修改。不要先执行会覆盖文件的命令。

## 每次提交前

```bash
git diff --check
npm run check
git status --short
git diff --cached
```

检查：

- 暂存区只有本轮文件。
- 没有环境文件、密钥、缓存、`.DS_Store` 或本地虚拟环境。
- 没有把未确认的活动资料、票务信息、主办方关系或个人资料写入公开文档。
- 用户可见变化已经写入 `CHANGELOG.md`。
- 计算、统计或价格变化已经列出输入、公式和各项结果。

## 内容维护

- 活动公开前确认 `review_status = approved`、`status` 正确、日期/地点/链接来自可靠资料。
- `is_anirox` 只有在有明确证据时才设置为 true；普通活动和 AniROX 活动分开表达。
- 精选推荐必须同时确认已审核、进行中和 `is_featured = true`。
- 主海报、头图、票务字段、QQ群链接要分别验证；图片不等于活动事实已确认。
- 活动结束或取消时更新状态，不要用删除记录替代状态维护。

## Supabase 维护

每次 schema、RLS、Auth 角色或 Storage policy 变化前：

1. 确认当前 Supabase 项目和环境。
2. 备份或导出 schema/data/policy，记录时间。
3. 写入 migration 并审阅 SQL。
4. 先在安全环境执行，再验证列、policy、RLS 和 Storage。
5. 更新 `lib/types.ts`、查询和相关文档。
6. 线上执行后做管理员和公开页面 smoke test。

注意：数据库备份不自动保存 Storage 图片对象；service role key 不得出现在客户端。

## 每周或每月维护

- GitHub：查看 Actions、失败的 PR、分支和 tag；确认 `main` 保护规则仍符合预期。
- Vercel：检查最近 Production Deployment、构建日志、Runtime Logs、环境变量更新时间和域名状态。
- Cloudflare：查看 DNS/SSL/TLS/规则变更，确认权威 NS、根域名和 `www` 都正常。
- GoDaddy：查看域名到期、自动续费、账户 2FA 和域名锁定。
- Supabase：确认备份/PITR 套餐、数据库容量、Auth 异常、Storage 容量和 policy 变化。
- 线上：访问首页、`/events`、`/anirox`、登录页，并检查 `sitemap.xml` 等 SEO 入口。

这些项目需要登录对应后台；没有看过就写“未核对”，不要写“正常”。

## 事故处理

### 页面或部署异常

1. 记录开始时间、受影响 URL、状态码和最近 commit。
2. 看 Vercel Deployment 和 Runtime Logs。
3. 区分代码、环境变量、Supabase、Cloudflare DNS/TLS 和缓存问题。
4. 需要恢复可用性时先用 Vercel 上一条成功部署回滚。
5. 修复后再开分支做 Preview；不要先改数据库或 DNS 试错。

### 数据或权限异常

1. 暂停相关运营入口，避免继续写坏数据。
2. 记录影响表、用户范围、时间窗口和最近 migration。
3. 先查看流水、RLS 和日志，保留证据。
4. 有备份和恢复方案后再操作；不要直接删除数据。

### 密钥疑似泄露

按 [部署说明](DEPLOYMENT.md) 的密钥变更步骤轮换，记录“已轮换/待更新/已验证”，不记录 key 内容。

## 维护记录格式

```text
日期：YYYY-MM-DD HH:mm Asia/Shanghai
维护人：姓名或账号标识
范围：代码 / 内容 / Supabase / Vercel / Cloudflare / GoDaddy / GitHub
已确认：……
执行：……
验证：命令或 URL；结果分别是什么
风险：……
待办：……
```
