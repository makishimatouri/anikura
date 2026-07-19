"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

interface Reward {
  id: string;
  event_id: string | null;
  title: string;
  type: "coupon" | "lottery_entry";
  points_cost: number;
  description: string | null;
  discount_amount: string | null;
  stock: number | null;
  events: { title: string } | null;
}

interface LotteryEvent {
  id: string;
  title: string;
  lottery_points_cost: number;
}

export default function PointsShopPage() {
  const [tab, setTab] = useState<"coupon" | "lottery">("coupon");
  const [coupons, setCoupons] = useState<Reward[]>([]);
  const [lotteries, setLotteries] = useState<LotteryEvent[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      if (data.session) loadData(data.session.user.id);
    });
  }, []);

  async function loadData(uid: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", uid)
      .single();
    setTotalPoints(profile?.total_points ?? 0);

    const { data: rewards } = await supabase
      .from("rewards")
      .select("*, events(title)")
      .eq("active", true)
      .eq("type", "coupon");
    setCoupons(rewards ?? []);

    const { data: events } = await supabase
      .from("events")
      .select("id, title, lottery_points_cost")
      .eq("has_lottery", true);
    setLotteries(events ?? []);
  }

  async function handleRedeemCoupon(reward: Reward) {
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }
    if (totalPoints < reward.points_cost) {
      alert("积分不足");
      return;
    }
    if (reward.stock !== null && reward.stock <= 0) {
      alert("库存不足");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", (await supabase.auth.getSession()).data.session!.user.id)
      .single();
    if (!profile || profile.total_points < reward.points_cost) {
      alert("积分不足");
      return;
    }

    const {
      data: { session: sess },
    } = await supabase.auth.getSession();
    const code = `ANI-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const { error } = await supabase.from("redemptions").insert({
      user_id: sess!.user.id,
      reward_id: reward.id,
      points_spent: reward.points_cost,
      code,
    });
    if (error) {
      alert("兑换失败：" + error.message);
      return;
    }

    await supabase
      .from("profiles")
      .update({ total_points: profile.total_points - reward.points_cost })
      .eq("id", sess!.user.id);
    await supabase.from("point_transactions").insert({
      user_id: sess!.user.id,
      amount: -reward.points_cost,
      type: "redeem",
      description: `兑换优惠券: ${reward.title}`,
      reference_id: reward.id,
    });
    if (reward.stock !== null) {
      await supabase
        .from("rewards")
        .update({ stock: reward.stock - 1 })
        .eq("id", reward.id);
    }
    alert(`兑换成功！券码：${code}`);
    loadData(sess!.user.id);
  }

  if (session === null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-14 pb-16 md:pt-20">
        <SectionHead en="POINTS" cn="积 分 商 城" />
        <p className="text-center text-text-muted py-10 mt-12">加载中…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 pt-14 pb-16 md:pt-20">
        <Reveal>
          <SectionHead en="POINTS" cn="积 分 商 城" />
        </Reveal>
        <div className="mt-12 text-center">
          <p className="text-text-muted mb-6">请先登录后查看积分商城</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="POINTS" cn="积 分 商 城" />
      </Reveal>

      <div className="mt-12 md:mt-14">
        {/* 我的积分 */}
        <Reveal>
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-5 mb-8 text-center">
            <p className="font-display text-4xl leading-none text-neon-pink">{totalPoints}</p>
            <p className="mt-2 text-[11px] tracking-[0.25em] text-text-muted">我的积分</p>
          </div>
        </Reveal>

      {/* Tab */}
      <div className="flex justify-center mb-8 border-b border-bg-elevated">
        <button
          onClick={() => setTab("coupon")}
          className={`px-5 py-3 text-sm tracking-widest border-b-2 -mb-px transition-colors ${
            tab === "coupon"
              ? "border-neon-purple text-neon-purple"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          优惠券兑换
        </button>
        <button
          onClick={() => setTab("lottery")}
          className={`px-5 py-3 text-sm tracking-widest border-b-2 -mb-px transition-colors ${
            tab === "lottery"
              ? "border-neon-pink text-neon-pink"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          活动门票抽奖
        </button>
      </div>

      {tab === "coupon" && (
        <div className="space-y-4">
          {coupons.length === 0 && (
            <p className="text-center text-text-muted py-12">
              暂无可兑换的优惠券
            </p>
          )}
          {coupons.map((reward) => (
            <div
              key={reward.id}
              className="bg-bg-card border border-bg-elevated rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-neon-purple/20 flex items-center justify-center text-2xl flex-shrink-0">
                🎟️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{reward.title}</h3>
                {reward.events && (
                  <p className="text-xs text-text-muted mt-0.5">
                    适用活动：{reward.events.title}
                  </p>
                )}
                {reward.description && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {reward.description}
                  </p>
                )}
                <p className="text-xs text-neon-purple mt-1">
                  消耗 {reward.points_cost} 积分
                  {reward.stock !== null && ` · 库存 ${reward.stock}`}
                </p>
              </div>
              <button
                onClick={() => handleRedeemCoupon(reward)}
                className="flex-shrink-0 px-4 py-2 rounded-lg bg-neon-purple hover:bg-neon-purple/80 text-white text-sm font-medium transition-colors"
              >
                兑换
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "lottery" && (
        <div className="space-y-4">
          {lotteries.length === 0 && (
            <p className="text-center text-text-muted py-12">
              暂无可参与的活动抽奖
            </p>
          )}
          {lotteries.map((event) => (
            <div
              key={event.id}
              className="bg-bg-card border border-bg-elevated rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-neon-pink/20 flex items-center justify-center text-2xl flex-shrink-0">
                🎁
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-xs text-neon-pink mt-1">
                  消耗 {event.lottery_points_cost} 积分 / 次
                </p>
              </div>
              <button
                onClick={() => alert("抽奖功能即将上线，敬请期待")}
                className="flex-shrink-0 px-4 py-2 rounded-lg bg-neon-pink hover:bg-neon-pink/80 text-white text-sm font-medium transition-colors"
              >
                参与抽奖
              </button>
            </div>
          ))}
        </div>
      )}

        <div className="mt-10 text-center">
          <Link href="/checkin" className="text-sm text-neon-purple hover:underline">
            ← 返回签到赚积分
          </Link>
        </div>
      </div>
    </div>
  );
}
