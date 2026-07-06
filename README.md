# Anikura CN

中国二次元音乐活动聚合平台，收录全国 Anikura、Vocaloid、东方 Project 等 club 活动信息。由 AniROX 厂牌维护。

## 主要功能

- 📅 全国活动日历与多维筛选（城市 / 类型 / 月份）
- 🎵 AniROX 厂牌专场活动
- 💬 QQ 一键加群
- 🔔 活动精选推荐轮播
- 📅 每日签到赚积分
- 🎟️ 积分商城（优惠券兑换 / 活动门票抽奖）

## 技术栈

- **前端**：Next.js 6 + TypeScript + Tailwind CSS 4
- **后端**：Supabase (PostgreSQL + Auth + Storage)
- **部署**：Vercel

## 本地开发

```bash
git clone https://github.com/makishimatouri/anikura.git
cd anikura
cp .env.local.example .env.local
# 填入 Supabase 配置
npm install
npm run dev
```

访问 http://localhost:3000

## 积分规则

- 每日签到：随机 5–20 积分，连续 7 天额外 +10
- 积分可兑换活动优惠券或参与抽奖

## License

© 2026 AniROX. All rights reserved.
