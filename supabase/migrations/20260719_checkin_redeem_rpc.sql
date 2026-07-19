-- 2026-07-19 签到 / 积分兑换原子化 RPC
--
-- 背景（代码审查确认的问题）：
--   1. 签到为「读 profile → 算连签 → insert checkins → insert point_transactions →
--      update profiles」多步客户端操作，中途失败会留下不一致状态（有签到记录但没加积分等）。
--      checkins 已有 UNIQUE(user_id, checkin_date)，重复签到不会翻倍，但前端静默吞错。
--   2. 积分兑换为「读余额 → insert redemptions → update profiles（基于旧值）→
--      update rewards 库存（基于旧值）」，并发下可扣成负分、超卖。
--
-- 方案：把两段逻辑下沉为 SECURITY DEFINER 函数，单事务执行 + 行锁（FOR UPDATE）。
--   - 业务日期一律在数据库侧按 Asia/Shanghai 计算，客户端无法伪造签到日期刷连签。
--   - 函数内用 auth.uid() 限定本人数据，SECURITY DEFINER 仅用于绕开 RLS 的多表写入，
--     search_path 固定为 public 防劫持。
--
-- 上线顺序：先在 Supabase 执行本迁移，再部署前端（前端上线前 rpc 不存在会报错）。

-- ============ 每日签到 ============
CREATE OR REPLACE FUNCTION public.perform_checkin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'Asia/Shanghai')::date;
  v_profile profiles%ROWTYPE;
  v_new_streak int;
  v_earned int;
  v_bonus int := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- 先锁本人 profile，串行化并发签到；
  -- 锁内再判已签到，保证并发第二个事务看到第一个的提交结果。
  SELECT * INTO v_profile FROM profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF EXISTS (SELECT 1 FROM checkins WHERE user_id = v_uid AND checkin_date = v_today) THEN
    RETURN json_build_object(
      'already', true,
      'streak', v_profile.checkin_streak,
      'total_points', v_profile.total_points
    );
  END IF;

  v_new_streak := CASE
    WHEN v_profile.last_checkin_date = v_today - 1 THEN COALESCE(v_profile.checkin_streak, 0) + 1
    ELSE 1
  END;

  -- 与原前端逻辑一致：基础随机 5–20 分，连签满 7 的倍数天额外 +10
  v_earned := floor(random() * 16 + 5)::int;
  IF v_new_streak >= 7 AND v_new_streak % 7 = 0 THEN
    v_bonus := 10;
  END IF;

  INSERT INTO checkins (user_id, checkin_date, points_earned)
    VALUES (v_uid, v_today, v_earned);
  INSERT INTO point_transactions (user_id, amount, type, description)
    VALUES (
      v_uid, v_earned + v_bonus, 'checkin',
      '每日签到' || CASE WHEN v_bonus > 0 THEN ' (连续' || v_new_streak || '天奖励)' ELSE '' END
    );
  UPDATE profiles
    SET checkin_streak = v_new_streak,
        last_checkin_date = v_today,
        total_points = COALESCE(total_points, 0) + v_earned + v_bonus
    WHERE id = v_uid;

  RETURN json_build_object(
    'already', false,
    'points', v_earned + v_bonus,
    'streak', v_new_streak,
    'total_points', COALESCE(v_profile.total_points, 0) + v_earned + v_bonus
  );
END;
$$;

-- ============ 积分兑换 ============
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile profiles%ROWTYPE;
  v_reward rewards%ROWTYPE;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- 锁奖品行：并发兑换在同一奖品上串行，库存扣减基于锁内最新值
  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reward_not_found';
  END IF;
  IF v_reward.active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'reward_inactive';
  END IF;
  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'out_of_stock';
  END IF;

  -- 锁本人 profile：积分扣减基于锁内最新余额，不会扣成负数
  SELECT * INTO v_profile FROM profiles WHERE id = v_uid FOR UPDATE;
  IF COALESCE(v_profile.total_points, 0) < v_reward.points_cost THEN
    RAISE EXCEPTION 'insufficient_points';
  END IF;

  -- 券码 8 位大写，redemptions.code 有唯一约束兜底
  v_code := 'ANI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO redemptions (user_id, reward_id, points_spent, code)
    VALUES (v_uid, p_reward_id, v_reward.points_cost, v_code);
  UPDATE profiles
    SET total_points = total_points - v_reward.points_cost
    WHERE id = v_uid;
  INSERT INTO point_transactions (user_id, amount, type, description, reference_id)
    VALUES (v_uid, -v_reward.points_cost, 'redeem', '兑换优惠券: ' || v_reward.title, p_reward_id);
  IF v_reward.stock IS NOT NULL THEN
    UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
  END IF;

  RETURN json_build_object('code', v_code, 'points_spent', v_reward.points_cost);
END;
$$;

-- 仅登录用户可调用（函数内再做 auth.uid() 校验）
REVOKE ALL ON FUNCTION public.perform_checkin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.perform_checkin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;

-- ============ 回滚 SQL（手工执行） ============
-- DROP FUNCTION IF EXISTS public.redeem_reward(uuid);
-- DROP FUNCTION IF EXISTS public.perform_checkin();
