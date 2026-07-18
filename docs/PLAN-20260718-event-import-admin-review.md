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

## 10. 待东离拍板

1. 归档位置：posters 桶 import-202607/ 目录（推荐）vs 直接引用 wall-posters 现有 URL
2. 识读方式：AI 视觉逐张（推荐）vs Vision OCR
3. 同名系列活动按场次保留（推荐）vs 只留一场
4. 非超管编辑已通过活动 → 回落 pending 导致暂时下线，接受（推荐）vs 不做限制
5. /events 归档视图做不做（推荐做）
6. 执行顺序 E0 备份迁移 → E1 识读报告 → 东离过目 → E2 落库 → E3 后台 UI → E4 墙切换，OK 吗
