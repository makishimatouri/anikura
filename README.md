# Anikura CN

Anikura CN 是中国国内二次元音乐活动聚合网站，收录 Anikura、Vocaloid、东方 Project、VTuber、游戏音乐等相关 club 活动信息。项目由 AniROX 发起和维护。

线上地址：https://www.anikura.cn

## 功能范围

- 全国活动列表、详情页、城市和类型筛选
- 首页精选活动轮播
- AniROX 厂牌活动独立页面
- 主办方联系与活动提交入口
- QQ 一键加群跳转
- 管理员登录、活动录入、编辑、审核和通知
- 用户注册、每日签到、积分、优惠券兑换和门票抽奖入口
- Supabase Storage 海报上传

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL/Auth/Storage
- Vercel + Cloudflare

## 本地开发

```bash
git clone git@github.com:makishimatouri/anikura.git
cd anikura
cp .env.local.example .env.local
npm install
npm run dev
```

访问 `http://localhost:3000`。

`.env.local` 需要填写 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

不要提交 `.env.local`，不要在截图或文档里暴露 Supabase secret key。

## 常用命令

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run check
```

## 版本留档

正式版本从 `v0.1.0` 开始。每次上线前先确认构建通过，再提交、打 tag、推送：

```bash
npm run check
git add .
git commit -m "release: v0.1.1"
git tag -a v0.1.1 -m "v0.1.1"
git push origin main
git push origin v0.1.1
```

更多说明见 [版本管理](docs/VERSIONING.md) 和 [变更记录](CHANGELOG.md)。

## 项目文档

- [架构说明](docs/ARCHITECTURE.md)
- [部署说明](docs/DEPLOYMENT.md)
- [版本管理](docs/VERSIONING.md)
- [维护清单](docs/MAINTENANCE.md)

## License

Copyright 2026 AniROX. All rights reserved.
