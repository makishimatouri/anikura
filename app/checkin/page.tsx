"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

export default function CheckinPage() {
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [result, setResult] = useState<{ points: number; streak: number } | null>(
    null
  );
  const [session, setSession] = useState<boolean | null>(null);

  async function loadStatus(uid: string) {
    const today = new Date().toISOString().split("T")[0];
    const { data: checkin } = await supabase
      .from("checkins")
      .select("points_earned")
      .eq("user_id", uid)
      .eq("checkin_date", today)
      .single();

    if (checkin) {
      setCheckedIn(true);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, total_points, checkin_streak, last_checkin_date")
      .eq("id", uid)
      .single();

    if (profile) {
      setStreak(profile.checkin_streak);
      setTotalPoints(profile.total_points);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setSession(false);
        return;
      }
      setSession(true);
      loadStatus(data.session.user.id);
    });
  }, []);

  async function handleCheckin() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const today = new Date().toISOString().split("T")[0];
    // 计算连续签到
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, total_points, checkin_streak, last_checkin_date")
      .eq("id", session.user.id)
      .single();

    const isConsecutive =
      profile?.last_checkin_date === yesterday ||
      profile?.last_checkin_date === today;
    const newStreak =
      profile?.last_checkin_date === today
        ? profile.checkin_streak
        : isConsecutive
          ? (profile?.checkin_streak ?? 0) + 1
          : 1;

    const earned = Math.floor(Math.random() * 16) + 5;
    const bonus = newStreak >= 7 && newStreak % 7 === 0 ? 10 : 0;

    const { error } = await supabase.from("checkins").insert({
      user_id: session.user.id,
      checkin_date: today,
      points_earned: earned,
    });
    if (!error) {
      await supabase.from("point_transactions").insert({
        user_id: session.user.id,
        amount: earned + bonus,
        type: "checkin",
        description: `每日签到${bonus > 0 ? ` (连续${newStreak}天奖励)` : ""}`,
      });
      await supabase
        .from("profiles")
        .update({
          checkin_streak: newStreak,
          last_checkin_date: today,
          total_points: (profile?.total_points ?? 0) + earned + bonus,
        })
        .eq("id", session.user.id);

      setCheckedIn(true);
      setStreak(newStreak);
      setTotalPoints((profile?.total_points ?? 0) + earned + bonus);
      setResult({ points: earned + bonus, streak: newStreak });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="CHECK-IN" cn="每 日 签 到" />
      </Reveal>

      <div className="mt-12 md:mt-14">
        {session === null ? (
          <p className="text-center text-text-muted py-10">加载中…</p>
        ) : !session ? (
          <Reveal>
            <div className="text-center">
              <p className="text-text-muted mb-6">请先登录后再签到</p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium"
              >
                去登录
              </Link>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            {/* 状态数字 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-bg-card border border-bg-elevated rounded-xl p-4 text-center">
                <p className="font-display text-4xl leading-none text-neon-purple">{streak}</p>
                <p className="mt-2 text-[11px] tracking-[0.25em] text-text-muted">连续签到 · 天</p>
              </div>
              <div className="bg-bg-card border border-bg-elevated rounded-xl p-4 text-center">
                <p className="font-display text-4xl leading-none text-neon-pink">{totalPoints}</p>
                <p className="mt-2 text-[11px] tracking-[0.25em] text-text-muted">总积分</p>
              </div>
            </div>

            {checkedIn ? (
              <div className="bg-bg-card border border-bg-elevated rounded-2xl p-8 space-y-4 text-center">
                <div className="text-5xl">🎉</div>
                <p className="text-xl font-semibold">今日已签到</p>
                {result && (
                  <p className="text-neon-purple font-medium">
                    获得 {result.points} 积分{result.streak >= 7 && result.streak % 7 === 0 && "（含连续奖励）"}
                  </p>
                )}
                <p className="text-sm text-text-muted">
                  每日 00:00 重置，明天继续来哦
                </p>
                <Link
                  href="/points"
                  className="inline-block mt-4 px-5 py-2 rounded-full border border-bg-elevated text-sm text-text-muted hover:text-text hover:border-neon-purple/50 transition-colors"
                >
                  去积分商城 →
                </Link>
              </div>
            ) : (
              <div className="bg-bg-card border border-bg-elevated rounded-2xl p-8 space-y-6 text-center">
                <div className="text-6xl">📅</div>
                <button
                  onClick={handleCheckin}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white text-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "签到中…" : "立即签到"}
                </button>
                <p className="text-sm text-text-muted">
                  每次签到随机获得 5–20 积分，连续 7 天额外 +10
                </p>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </div>
  );
}
