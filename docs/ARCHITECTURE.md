# 架构说明

Anikura CN 是一个 Next.js 单体应用。公开页面、管理员页面、用户功能和轻量 API 路由在同一个仓库中维护；数据、认证、权限和图片存储由 Supabase 提供。

## 目录结构

```text
app/                  Next.js App Router 页面和 API route
components/           可复用 UI 组件
lib/                  Supabase 客户端、查询、认证、管理员客户端和类型
public/               静态资源
supabase/migrations/  已提交的数据库增量 SQL
docs/                 项目维护、部署、方法和版本文档
.github/              CI 和协作模板
```

## 路由地图

| 路由 | 作用 | 访问边界 |
| --- | --- | --- |
| `/` | Anikura 介绍、精选推荐、近期活动；移动端是分屏入口 | 公开 |
| `/events` | 全国活动列表和筛选 | 公开，仅展示审核通过的进行中活动 |
| `/events/[id]` | 活动详情、海报、QQ群入口 | 公开，仅展示审核通过活动 |
| `/anirox` | AniROX 活动专区 | 公开，仅展示 `is_anirox = true` 且审核通过 |
| `/contact` | 主办方联系入口 | 公开 |
| `/about` | 站点说明、版本/功能介绍区域 | 公开 |
| `/auth/login`、`/auth/signup` | 用户登录注册 | 公开 |
| `/checkin`、`/points`、`/notifications` | 签到、积分商城、通知 | 登录用户 |
| `/admin/login` | 管理员登录 | 公开入口，登录后继续检查角色 |
| `/admin/*` | 活动、审核、奖品、用户和面板 | 管理员/超管，具体操作按角色区分 |
| `/api/admin/users` | 用户管理员角色修改 | 超管 |
| `/api/notifications` | 读取/标记通知 | 登录用户；服务端管理操作使用高权限客户端 |

## 数据流

```text
公开页面
  -> lib/queries.ts 或组件查询
  -> Supabase anon client + RLS
  -> events / profiles 等表

管理员页面
  -> session cookie
  -> middleware 做入口拦截
  -> 页面或 API 再检查 profiles.is_admin / is_super_admin
  -> Supabase RLS 或受控 server admin client

图片上传
  -> EventForm.tsx
  -> Storage bucket: posters
  -> headers/ 或 posters/ 前缀
  -> public URL 写入 events.header_image_url / poster_url
```

入口拦截、页面角色判断、数据库 RLS 是三层不同的事情。修复权限问题时不能只改导航隐藏，也不能只改 middleware。

## 公开活动查询规则

`lib/queries.ts` 和 `components/events/EventList.tsx` 的公开查询要保留：

```text
review_status = "approved"
```

首页精选还需要 `status = "ongoing"` 和 `is_featured = true`；AniROX 页面还需要 `is_anirox = true`。管理员列表可以读取更宽的集合，但调用点必须经过角色和 RLS 审核。

## Supabase 客户端边界

- `lib/supabase.ts`：浏览器端 anon client，以及仅在服务端条件下初始化的高权限客户端变量。
- `lib/auth.ts`：服务端 cookie session 和 `requireAdmin()`。
- `lib/admin.ts`：使用 `SUPABASE_SERVICE_ROLE_KEY` 创建服务端管理客户端。
- `lib/types.ts`：当前 TypeScript 数据形状，不是完整数据库 schema。

任何使用 service role 的代码都要保持服务端边界。不要把环境变量前缀、import 路径或组件位置误认为安全边界；真正的边界是运行环境、session、RLS 和服务端代码。

## 数据表和 schema 维护

代码依赖以下表：

```text
events
profiles
checkins
point_transactions
rewards
redemptions
notifications
```

当前仓库完整保存的 migration 不足以从零重建所有表和 policy；只有头图字段 migration 已明确提交。改表前应先从线上 Supabase 导出 schema/policy，补充可复现 migration，再同步类型和文档。

## 图片展示约定

- `header_image_url`：可选横向头图，首页横向卡片和 AniROX 展示优先使用。
- `poster_url`：主海报，详情页尽量保持原比例；头图为空时可以作为横向展示回退。
- `posters` bucket：当前上传代码使用 `headers/`、`posters/` 两个前缀。
- 头图字段必须先执行 `supabase/migrations/20260709_add_event_header_image.sql`。

## 维护边界

- 页面改动先确认对应 route 和数据查询，不要把 demo fallback 当成生产数据库数据。
- 涉及日期、签到、随机推荐、积分或库存时，按 `docs/METHODS.md` 输出计算过程。
- 涉及部署、域名、密钥、数据库或存储时，按 `docs/OPERATIONS.md` 和 `docs/DEPLOYMENT.md` 先做风险检查。
