"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalEvents: number;
  totalUsers: number;
  adminCount: number;
  totalRedemptions: number;
  totalCheckins: number;
  ticketRedemptions: number;
}

interface AdminEvent {
  id: string;
  title: string;
  date: string;
  city: string;
  review_status: string | null;
  created_by: string | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [pendingReview, setPendingReview] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, is_super_admin")
        .eq("id", data.session.user.id)
        .single();
      if (!profile?.is_admin && !profile?.is_super_admin) {
        window.location.href = "/";
        return;
      }
      setIsSuper(profile?.is_super_admin ?? false);
      loadStats(profile?.is_super_admin ?? false);
    });
  }, []);

  async function loadStats(isSuperAdmin: boolean) {
    const [eventsRes, usersRes, redempRes, checkRes] = await Promise.all([
      supabase.from("events").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("redemptions").select("id", { count: "exact" }),
      supabase.from("checkins").select("id", { count: "exact" }),
    ]);

    const { data: recent } = await supabase
      .from("events")
      .select("id, title, date, city, review_status, created_by")
      .order("created_at", { ascending: false })
      .limit(5);

    setStats({
      totalEvents: eventsRes.count ?? 0,
      totalUsers: usersRes.count ?? 0,
      adminCount: 0,
      totalRedemptions: redempRes.count ?? 0,
      totalCheckins: checkRes.count ?? 0,
      ticketRedemptions: 0,
    });
    setRecentEvents(recent ?? []);
    if (isSuperAdmin) {
      const { data: pending } = await supabase
        .from("events")
        .select("id, title, date, city, review_status, created_by")
        .eq("review_status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      setPendingReview(pending ?? []);
    }
    setLoading(false);
  }

  async function handleApproveReview(id: string) {
    if (!confirm("确认通过该活动？")) return;
    await supabase.from("events").update({ review_status: "approved" }).eq("id", id);
    const { data: event } = await supabase.from("events").select("created_by, title").eq("id", id).single();
    if (event?.created_by) {
      await supabase.from("notifications").insert({
        user_id: event.created_by,
        type: "event_approved",
        title: "活动审核通过",
        message: `你的活动「${event.title}」已通过审核并上线`,
        reference_id: id,
      });
    }
    loadStats(true);
  }

  async function handleRejectReview(id: string) {
    const reason = prompt("未通过原因（可选，将通知提交者）：");
    if (reason === null) return;
    await supabase.from("events").update({ review_status: "rejected", review_note: reason || null }).eq("id", id);
    const { data: event } = await supabase.from("events").select("created_by, title").eq("id", id).single();
    if (event?.created_by) {
      await supabase.from("notifications").insert({
        user_id: event.created_by,
        type: "event_rejected",
        title: "活动审核未通过",
        message: `你的活动「${event.title}」未通过审核${reason ? "，原因：" + reason : ""}`,
        reference_id: id,
      });
    }
    loadStats(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-text-muted">加载中…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">超级管理面板</h1>
          <p className="text-sm text-text-muted mt-1">网站运营总览与快速操作</p>
        </div>
        <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-full border border-bg-elevated text-text-muted hover:text-text transition-colors">
          退出
        </button>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🎪" label="活动总数" value={stats?.totalEvents ?? 0} />
        <StatCard icon="👥" label="注册用户" value={stats?.totalUsers ?? 0} />
        <StatCard icon="📅" label="累计签到" value={stats?.totalCheckins ?? 0} />
        <StatCard icon="🎟️" label="积分兑换" value={stats?.totalRedemptions ?? 0} />
      </div>

      {/* 审核队列（仅超管可见） */}
      {isSuper && pendingReview.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            待审核 <span className="text-sm text-yellow-400">({pendingReview.length})</span>
          </h2>
          <div className="space-y-2">
            {pendingReview.map((ev) => (
              <div key={ev.id} className="bg-bg-card border border-yellow-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/events/${ev.id}`} className="font-medium hover:text-neon-purple">
                      {ev.title}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5">
                      {ev.date} · {ev.city}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 flex-shrink-0">待审核</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-bg-elevated">
                  <Link
                    href={`/admin/events/${ev.id}`}
                    className="text-xs text-text-muted hover:text-text"
                  >
                    查看完整信息 →
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReview(ev.id)}
                      className="text-xs px-4 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500"
                    >
                      审核通过
                    </button>
                    <button
                      onClick={() => handleRejectReview(ev.id)}
                      className="text-xs px-4 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <ActionLink href="/admin/events/new" icon="➕" label="上新活动" desc="创建新的活动信息" />
        <ActionLink href="/admin/events" icon="📋" label="活动管理" desc="编辑/下架/删除活动" />
        <ActionLink href="/admin/rewards" icon="🎁" label="奖品管理" desc="优惠券/抽奖名额" />
        <ActionLink href="/admin/users" icon="👤" label="管理员管理" desc="添加/移除管理员" />
      </div>

      {/* 近期活动 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">近期活动</h2>
        {recentEvents.length === 0 ? (
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-8 text-center text-text-muted">
            暂无活动数据
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/admin/events/${ev.id}`}
                className="block bg-bg-card border border-bg-elevated rounded-xl p-4 hover:border-neon-purple/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ev.title}</span>
                    {ev.review_status === "pending" && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400">审核中</span>
                    )}
                    {ev.review_status === "rejected" && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">未通过</span>
                    )}
                    <span className="text-xs text-text-muted">{ev.date}</span>
                  </div>
                  <span className="text-xs text-text-muted">{ev.city}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-bg-card border border-bg-elevated rounded-xl p-4 flex flex-col items-center text-center">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-text-muted mt-1">{label}</span>
    </div>
  );
}

function ActionLink({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="bg-bg-card border border-bg-elevated rounded-xl p-5 hover:border-neon-purple/50 transition-colors block"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
