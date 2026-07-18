-- 批量导入 + 后台复核：events 新增批次/来源/驳回备注列
-- 执行方式：Supabase Dashboard SQL Editor（IF NOT EXISTS 可安全重复执行）
-- 依据：docs/PLAN-20260718-event-import-admin-review.md 第 6 节

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS import_batch text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS review_note text;
