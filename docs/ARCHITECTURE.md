# 架构说明

Anikura CN 是一个 Next.js 单体应用。前端页面、管理后台、轻量 API 路由都在同一个仓库中维护，数据、认证和文件存储由 Supabase 提供。

## 目录结构

```text
app/                  Next.js App Router 页面和 API 路由
components/           可复用 UI 组件
lib/                  Supabase 客户端、查询函数、认证辅助和类型
public/               静态资源
docs/                 项目维护文档
.github/              GitHub 工作流和协作模板
```

## 页面模块

- `/`：首页，展示 Anikura 介绍、随机推荐活动和近期活动
- `/events`：全国活动列表
- `/events/[id]`：活动详情
- `/anirox`：AniROX 厂牌活动
- `/contact`：主办方联系入口
- `/about`：站点说明和友链区域
- `/auth/login`、`/auth/signup`：用户登录注册
- `/checkin`、`/points`、`/notifications`：用户积分和通知相关页面
- `/admin/*`：管理员后台、活动管理、审核、奖品和用户管理

## 数据服务

Supabase 负责：

- PostgreSQL 数据表
- Auth 用户认证
- Row Level Security 权限控制
- Storage 海报文件上传

前端公开读取使用 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。管理操作依赖登录用户权限和 Supabase RLS，不要把 `SUPABASE_SERVICE_ROLE_KEY` 暴露到浏览器端。

## 主要数据表

当前应用代码依赖以下表：

- `events`：活动信息、海报原图、横向头图、审核状态、随机推荐标记、抽奖配置、创建者
- `profiles`：用户资料、积分、管理员权限、签到状态
- `checkins`：每日签到记录
- `point_transactions`：积分流水
- `rewards`：优惠券和奖品
- `redemptions`：兑换记录
- `notifications`：用户通知

数据库结构以 Supabase 项目为准。改表前先备份 SQL，并同步更新代码类型和文档。
