-- events 表 RLS 收紧（依据 internal/security-baseline-20260719.md 问题项 1、2）
-- 现状：anon_read(role=public, using true) 匿名可读全部（含 pending 与内部列）；
--       auth_update/auth_delete using(true) 任意登录用户可改删全部活动。
-- 目标：匿名仅可读已通过；登录用户可读已通过+自己的投稿；写操作仅管理员。
-- 执行方式：Supabase Management API（scripts/import/run-sql.mjs）。执行前需东离确认。
-- 不动：auth_insert（登录用户投稿路径）。

-- 1. 匿名读：仅已通过的活动（原 public 策略删除后拆成 anon / authenticated 两条）
DROP POLICY anon_read ON public.events;
CREATE POLICY anon_read ON public.events
  FOR SELECT TO anon
  USING (review_status = 'approved');

-- 2. 登录用户读：已通过 + 自己投的 + 管理员全量（后台复核依赖）
CREATE POLICY auth_read ON public.events
  FOR SELECT TO authenticated
  USING (
    review_status = 'approved'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin OR is_super_admin)
    )
  );

-- 3. 更新/删除：仅管理员（代码里只有后台页面用这两个操作，已核对无普通用户路径）
DROP POLICY auth_update ON public.events;
CREATE POLICY auth_update ON public.events
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin OR is_super_admin)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin OR is_super_admin)
    )
  );

DROP POLICY auth_delete ON public.events;
CREATE POLICY auth_delete ON public.events
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin OR is_super_admin)
    )
  );
