# Anikura CN

Anikura CN 是中国国内二次元音乐活动聚合网站，收录 Anikura、Vocaloid、东方 Project、VTuber、游戏音乐等相关 club 活动信息。项目由 AniROX 发起和维护。

线上地址：<https://www.anikura.cn>

## 当前能力

- 全国活动列表、详情、城市/类型/月份筛选
- 桌面端首页精选推荐和近期活动
- 移动端首页整屏下滑的分板块入口
- AniROX 厂牌活动独立页面
- 主办方联系与活动提交入口
- QQ 加群跳转
- 管理员登录、活动录入、编辑、审核和通知
- 用户注册、每日签到、积分、优惠券兑换和门票抽奖入口
- Supabase Storage 海报和头图上传

## 技术栈和线上分工

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 4
- Supabase：PostgreSQL、Auth、RLS、Storage
- Vercel：Next.js 构建和部署
- Cloudflare：权威 DNS、代理/CDN、TLS
- GoDaddy：域名注册和续费
- GitHub：源码、版本 tag/release、Actions CI

五个服务的职责、维护入口、回滚边界和故障排查见 [外部服务与线上维护手册](docs/OPERATIONS.md)。

## 本地开发

```bash
git clone git@github.com:makishimatouri/anikura.git
cd anikura
cp .env.local.example .env.local
npm install
npm run dev
```

访问 <http://localhost:3000>。

`.env.local` 需要填写 Supabase 配置：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

不要提交 `.env.local`，不要在截图、Issue、日志或文档中暴露 `SUPABASE_SERVICE_ROLE_KEY`。

## 常用命令

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run check
```

`npm run check` 是发布前本地门禁，依次执行 typecheck、lint 和 build。具体报告格式见 [可复用方法](docs/METHODS.md)。

## 文档入口

新对话先读 [AGENTS.md](AGENTS.md) 和 [文档导航](docs/INDEX.md)。

- [项目指导与状态](docs/PROJECT_GUIDE.md)：目前进度、已关闭事项、待确认问题和踩坑
- [架构说明](docs/ARCHITECTURE.md)：目录、路由、数据流、权限和数据库对象
- [外部服务与线上维护](docs/OPERATIONS.md)：Supabase、GoDaddy、Vercel、Cloudflare、GitHub
- [部署说明](docs/DEPLOYMENT.md)：预览、生产、DNS 核验和回滚
- [可复用方法](docs/METHODS.md)：筛选、日期、积分、图片和检查结果
- [版本管理](docs/VERSIONING.md)：分支、tag、Release、变更记录和归档
- [维护清单](docs/MAINTENANCE.md)：日常、每周、发布前和事故处理
- [新对话交接模板](docs/HANDOFF_TEMPLATE.md)
- [变更记录](CHANGELOG.md)

## 版本留档

正式版本从 `v0.1.0` 开始。`v0.3.0` 是开发阶段误命名，仅保留作历史记录。版本文件以 Git tag 和 GitHub Releases 为准，commit history 是底层回滚线；GitHub Projects 不承担版本归档。

发布前先读 [版本管理](docs/VERSIONING.md)。不要在没有检查线上影响的情况下直接向 `main` 推送，因为该分支可能触发 Vercel 生产部署。

## License

Copyright 2026 AniROX. All rights reserved.
