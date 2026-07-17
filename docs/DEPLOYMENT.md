# 部署、域名核验与回滚

## 当前部署模型

```text
GitHub main / Preview branch
  -> Vercel build
  -> Cloudflare DNS / proxy / TLS
  -> anikura.cn 和 www.anikura.cn
  -> Supabase 数据、Auth、Storage
```

GoDaddy 负责域名注册和续费，Cloudflare Nameserver 已经接管 DNS。各服务的职责不要混用，完整说明见 [外部服务与线上维护](OPERATIONS.md)。

## 发布前检查

### 本地

```bash
git status --short --branch
git diff --check
npm run check
git diff --stat
```

检查暂存区：

- 没有 `.env.local`、`.env`、`.venv`、`.next`、`node_modules`、`.DS_Store`。
- 没有真实 Supabase key、个人信息、内部后台截图或未确认的活动资料。
- 业务代码改动对应的用户可见变化已写入 `CHANGELOG.md`。
- 数据库字段变化已经有 migration，并确认执行顺序。

### 预览

优先推送独立分支并使用 Vercel Preview。至少检查：

- `/`：桌面/移动端首页，精选为空时的回退行为。
- `/events`：默认列表、城市、类型、月份筛选。
- `/events/[id]`：海报比例、头图回退、QQ群链接。
- `/anirox`：AniROX 过滤和品牌边界。
- `/auth/login`、`/admin/login`：登录和未登录跳转。
- 本轮涉及的管理员、签到、积分或通知页面。

## 生产发布

当前生产分支按仓库和 Vercel 设置通常为 `main`，但每次操作仍应在 Vercel Project Settings 复核。合并或推送 `main` 前先确认：

1. GitHub CI 通过。
2. 本地 `npm run check` 通过。
3. Vercel Production 环境变量没有待处理修改。
4. 如果有 Supabase migration，已按顺序执行并验证。
5. 用户知道这次操作可能触发生产部署。

部署完成后记录：commit、tag（若有）、Vercel Deployment、发布时间、smoke test 结果和异常。

## 域名核验

只读核验命令：

```bash
dig +short NS anikura.cn
dig +short A anikura.cn
dig +short CNAME www.anikura.cn
curl -sSIL --max-time 20 https://anikura.cn
curl -sSIL --max-time 20 https://www.anikura.cn
```

如果环境中没有 `curl`，直接用浏览器或平台探针替代；不要因为一次连接失败就判断部署损坏。当前历史上根域名会 308 到 `www`，实际目标以 Vercel 和 Cloudflare 当前配置为准。

检查顺序：

1. `dig NS` 确认权威 Nameserver 是否仍在 Cloudflare。
2. Cloudflare DNS 确认根域名和 `www` 的记录、代理状态和 TTL。
3. Vercel Domains 确认域名状态为有效配置。
4. `curl -I` 或浏览器确认最终状态码、Location、证书和页面内容。

不要把 GoDaddy DNS、Cloudflare DNS 和 Vercel 域名验证当成同一个页面解决。

## 回滚层次

### 前端/部署回滚

优先在 Vercel 回滚上一条成功 Deployment。回滚后重新检查主要页面和日志。Vercel 回滚不会恢复：

- Supabase 表数据和 RLS。
- Storage 图片对象。
- 环境变量当前值。
- Cloudflare DNS、TLS 或规则。

### 代码回滚

查看旧版本：

```bash
git fetch --tags
git show --stat v0.1.0
git show --stat v0.1.54
```

需要从旧版本修复时先建分支：

```bash
git switch -c fix/from-v0.1.54 v0.1.54
```

不要在 detached HEAD 上直接开发，也不要为了修前端错误删除 Supabase 数据。

### 数据库回滚

数据库恢复是独立事故流程。先确认备份时间、数据损失窗口、Storage 是否需要单独恢复、是否会停机，再执行。没有用户确认和恢复方案时，只能做只读核对。

## 密钥变更

如果怀疑密钥泄露：

1. 不要把泄露值复制到 Issue 或聊天。
2. 在 Supabase 轮换或撤销对应 key。
3. 更新 Vercel 对应环境变量并重新部署。
4. 检查 GitHub history、Actions logs、截图和聊天记录中的暴露范围。
5. 重新运行 smoke test，并在维护记录中写时间和影响范围，不写秘密本身。
