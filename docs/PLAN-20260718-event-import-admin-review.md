# 活动库批量导入 + 后台复核编辑 执行方案

版本：v1 · 2026-07-18 · 状态：待东离拍板，由执行 session 实施
背景：海报墙素材（58 张国内 anikura 海报）目前在 wall-posters 素材桶，东离要求海报墙改为从活动库拉取，
 folder 海报全部归档为活动库事件，AI 预填字段，人工后台复核。

## 1. 现状盘点（已确认事实）

- 审核骨架已存在：EventForm 创建/编辑时，非超管提交 review_status=pending、超管=approved；
  超管在编辑页对 pending 活动有 通过/驳回 按钮（components/admin/EventForm.tsx）
- /admin/events 已有全量活动列表（含删除、精选开关），/admin/events/[id] 已有编辑页
- 通知系统已存在（notifications 表 + /api/notifications；具体列名执行时先查证再写插入）
- 海报墙点击跳转已实现：库内活动磁贴 → /events/[id]；素材桶磁贴 → /events
- events 表字段见 lib/types.ts；目前缺批次/来源标记列
- 公开列表 /events 只显示 status=ongoing 且 approved；详情页只看 review_status=approved（不限 status）

## 2. 总体数据流

文件夹原图 → 压缩归档到 posters 桶（批次目录） → AI 识读生成字段 → 写入 events 表（pending） →
后台人工复核编辑 → 超管批量通过 → 海报墙/详情页自动生效（墙改为只读活动库）

wall-posters 桶此后不再被网站读取，留作原始素材备份。

## 3. 导入管线（E1-E2）

1. E0 备份：导出 events 表快照到仓库外备份目录；打 git tag archive/pre-bulk-import-20260718
2. 去重：MD5 精确去重 + 感知哈希近似去重 + 识读时目检复核。
   注意：系列活动的不同场次（如 ANIPULSE Vol.1/Vol.4、昆练会 1.0）不是重复，保留；
   与库内已有活动（ヲ册那）重复的跳过并记录在报告里
3. AI 视觉识读（推荐，替代传统 OCR）：逐张读取海报生成结构化 JSON。
   依据：AGENTS.md 技术笔记明确 Vision OCR 对漫展特效字体效果差，AI 视觉理解远强于纯 OCR；
   OCR 仅作日期数字的辅助交叉
4. 生成 import-report.json + 人读摘要（每张一行：识别出的标题/日期/城市 + 低置信字段标记），东离过目后执行写入
5. 归档上传：posters 桶 import-202607/wall-XX.jpg（最长边 900 已压好，直接复用 /tmp/wall-optimized 的中间产物，若已清理则重压）
6. 批量 insert：review_status=pending、source=bulk-import、import_batch=2026-07-folder-58、created_by=东离账号 id

## 4. 字段映射与置信度规则

| 字段 | 来源 | 不确定时 |
|---|---|---|
| title | 海报主标题 | 待补充 |
| date | 海报日期（缺年份按上下文推断并标低置信） | 2099-12-31 占位 + 低置信标记 |
| start_time/end_time | 海报时间段 | null |
| city | 海报城市，归一到现有城市表，表外填 其他 | 待补充 |
| venue | 场地名+地址 | 待补充 |
| organizer | 主办/厂牌 | 待补充 |
| is_anirox | 仅当海报有明确 AniROX 主办证据才 true（从严，宁缺毋滥） | false |
| tags | 关键词判断（Vocaloid/东方/游戏/VTuber/动漫歌曲） | [anikura] 兜底 |
| ticket_price/ticket_link | 票价文字 / 二维码无法提取链接 | 待补充 / null |
| qq_group/qq_group_name | 群号文字 | null |
| description | 其余文字要点 + 固定后缀【批量导入，待人工复核】 | — |
| status | date 早于今天 → ended，否则 ongoing | — |
| review_status | pending | — |

任何字段为"待补充"或低置信的行，在后台列表打「待确认」badge，方便人工聚焦。

## 5. 后台改动清单（E3）

1. /admin/events 列表：增加 review_status 页签（全部/待审核/已通过/已驳回）+ import_batch 批次过滤 + 海报缩略图列 + 待确认 badge
2. 编辑页并排审阅布局：左侧大图海报（可放大），右侧表单。复核场景下不用来回切页面，这是人工效率的关键
3. 超管批量操作：列表多选 + 批量通过（批次导入复核完一批后一键 approved）
4. 非超管编辑已通过的活动：保存后回落 pending（现有行为保留），活动暂时从公开区下线，
   同时给所有超管写一条通知（通知插入点：EventForm handleSubmit 成功后；notifications 表结构执行时先查证）
5. 超管编辑不受影响（直接 approved），驳回时允许填一句驳回原因（存入新列 review_note，可留空）

## 6. 数据库迁移（E0 一起做）

```sql
alter table events add column if not exists import_batch text;
alter table events add column if not exists source text default 'manual';
alter table events add column if not exists review_note text;
```

## 7. 海报墙切换（E4）

- PosterWall 数据源改为仅 getWallEvents（已审核、有海报、不限 status），删除素材桶读取
- 磁贴全部带信息板并链到详情页（素材桶磁贴退役）
- 验收标准：墙上每张海报可点进对应活动详情

## 8. 建议的增补功能（可选，东离拍板）

- /events 归档视图：status=ended 的历史活动公开可浏览（独立页签或 ?status=ended）。
  强烈建议做：导入的 58 张里大量是往届活动，没有归档视图它们只能活在墙上，详情页流量入口缺失；工作量小
- 待确认 badge（见第 4 节）
- 其余不建议做：批次管理专页（用列表过滤足够）、pending-changes 双写模型（过度工程）

## 9. 安全与回滚

- 导入前：events 表导出快照 + git tag；归档文件保留本地源文件夹不动
- 导入脚本支持 --dry-run：先出完整清单不落库
- 出错回滚：delete from events where import_batch='2026-07-folder-58' 一条 SQL 清批

## 10. 已查证落实的点（2026-07-18 补充）

- notifications 表结构已确认：id / user_id / type / title / message / reference_id / is_read / created_at，
  已有 event_rejected 类型在用；非超管提交审核的通知可复用此结构（新 type 如 event_review_needed）
- 58 张素材 MD5 精确去重：无完全重复文件；近似重复（同系列活动不同场次）在 AI 识读时目检区分
- AI 识读样例（两张，验证可行）：
  - wall-04：ANIPULSE Vol.1 in NANJING / 2026-07-04 14:00 / 南京 / 集庆舞蹈文化艺术工作室（秦淮区江苏通信大厦泽天大酒店6F）/ 预售39R 现场49R / DJ 阵容完整可读 / 主办待补充
  - wall-06：肉？フェス！in NANJING / 日期海报未印（待补充，演示了占位流程）/ 南京 / 户外场地（名称待补充）/ 完整 timetable 可读（14:00-20:00 七组 DJ）/ 御宅艺OK 光害大欢迎等描述完整

## 11. 东离决策（2026-07-18）

1. 归档位置：方案 A 变体（东离定）：先识读后归档，按活动实际日期分目录——2026-07 及以后的活动进 posters/YYYY-MM/（文件名带城市+活动名），7 月前已结束活动统一进 posters/past/（过往活动目录）。
   注意（已在讨论中澄清）：存储桶目录与活动页月份筛选无关，筛选读数据库 date 字段
2. 识读方式：AI 视觉逐张识读（东离确认，不省 token，可按需压图降本）
3. 同名系列活动：全保留 ✓
4. 非超管编辑已通过活动 → 回落 pending 暂时下线：接受 ✓
5. /events 归档视图：做 ✓（东离细化：以"过往活动"选项并入时间筛选器，选中显示 status=ended 活动按日期倒序，城市/类型筛选照常生效）
6. 执行顺序 E0 → E4：OK ✓

## 12. 执行进度（2026-07-18 执行 session 记录）

- E0 完成：events 快照导出至仓库外备份目录（`backups/20260718-bulk-import/events-snapshot-20260718.json`）；
  git tag `archive/pre-bulk-import-20260718` 已打；迁移 SQL 写入 `supabase/migrations/20260718_event_import_review_columns.sql`，
  但本机无 DDL 通道（无 supabase CLI / access token / DB 密码，PostgREST 不支持 DDL），需东离在 SQL Editor 执行
- E1 完成：58 张全部 AI 识读。结果 45 条活动 + 13 张跳过（4 张完全重复：wall-31/32/48/58；
  8 张同活动合并版：wall-06/07/27/28/29/36/47/56；1 张库内已有：wall-41 ヲ册那）。
  产物：`backups/20260718-bulk-import/reading.jsonl`、`import-report.json`、`summary.md`
- E2 就绪：`scripts/import/e2-import.mjs --dry-run` 已验证（含批次防重复、迁移缺失检测）；待东离过目报告 + 执行迁移后正式跑
- E3 完成：/admin/events 审核页签+批次过滤+缩略图+待确认 badge+超管批量通过；编辑页并排审阅（左图右表单）；
  非超管编辑已通过活动回落 pending 并经 /api/notify-supers 通知超管；驳回原因存 review_note（EventForm + dashboard）
- E4 完成：PosterWall 改为仅 getWallEvents（limit 60），getWallPosters 删除；
  /events 月份筛选新增「过往活动」（month=past，status=ended 按日期倒序，城市/类型照常生效）
- 验证：`npm run check` 通过；本地 dev 冒烟 /、/events、/events?month=past 均 200，海报墙正常渲染
- 代码已提交到 codex/redesign-phase2（未推送；推送 main 会触发生产部署，待东离发话）
