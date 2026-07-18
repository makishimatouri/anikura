"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AdminEvent } from "@/lib/types";

type ReviewTab = "all" | "pending" | "approved" | "rejected";

const REVIEW_TABS: { value: ReviewTab; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已驳回" },
];

/** 批量导入且含待补/低置信字段的行，复核时优先处理 */
function needsConfirm(event: AdminEvent): boolean {
  if (event.source !== "bulk-import") return false;
  const fields = [event.title, event.city, event.venue, event.organizer, event.ticket_price];
  return (
    fields.some((f) => f?.includes("待补充")) ||
    (event.description ?? "").includes("低置信")
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendationSavingId, setRecommendationSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<ReviewTab>("all");
  const [batch, setBatch] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchSaving, setBatchSaving] = useState(false);

  async function fetchEvents() {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    setEvents((data ?? []) as AdminEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }
      setUserId(data.session.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, is_super_admin")
        .eq("id", data.session.user.id)
        .single();
      if (!profile?.is_admin && !profile?.is_super_admin) {
        window.location.href = "/";
        return;
      }
      setIsSuper(!!profile.is_super_admin);
      fetchEvents();
    });
  }, []);

  const batches = useMemo(
    () => [...new Set(events.map((e) => e.import_batch).filter((b): b is string => !!b))],
    [events]
  );

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (tab === "all" || e.review_status === tab) &&
          (batch === "all" || e.import_batch === batch)
      ),
    [events, tab, batch]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<ReviewTab, number> = { all: events.length, pending: 0, approved: 0, rejected: 0 };
    for (const e of events) {
      if (e.review_status === "pending") counts.pending++;
      else if (e.review_status === "approved") counts.approved++;
      else if (e.review_status === "rejected") counts.rejected++;
    }
    return counts;
  }, [events]);

  const selectableIds = useMemo(
    () => filtered.filter((e) => e.review_status === "pending").map((e) => e.id),
    [filtered]
  );
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(selectableIds));
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除这个活动？")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      fetchEvents();
    }
  }

  async function handleToggleRecommendation(event: AdminEvent) {
    if (!isSuper) return;
    setRecommendationSavingId(event.id);
    const next = !event.is_featured;
    const { error } = await supabase
      .from("events")
      .update({ is_featured: next, updated_at: new Date().toISOString() })
      .eq("id", event.id);

    if (error) {
      alert("精选推荐状态更新失败：" + error.message);
    } else {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id ? { ...item, is_featured: next } : item
        )
      );
    }
    setRecommendationSavingId(null);
  }

  async function handleBatchApprove() {
    if (!isSuper || selected.size === 0) return;
    if (!confirm(`确认批量通过选中的 ${selected.size} 个活动？`)) return;
    setBatchSaving(true);
    const ids = [...selected];
    const { error } = await supabase
      .from("events")
      .update({ review_status: "approved", updated_at: new Date().toISOString() })
      .in("id", ids);
    if (error) {
      alert("批量通过失败：" + error.message);
    } else {
      // 通知提交者（跳过自己，批量导入的提交者就是超管本人）
      const targets = events.filter((e) => ids.includes(e.id) && e.created_by && e.created_by !== userId);
      await Promise.all(
        targets.map((e) =>
          supabase.from("notifications").insert({
            user_id: e.created_by,
            type: "event_approved",
            title: "活动审核通过",
            message: `你的活动「${e.title}」已通过审核并上线`,
            reference_id: e.id,
          })
        )
      );
      setSelected(new Set());
      fetchEvents();
    }
    setBatchSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-text-muted">加载中…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">活动管理</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/events/new"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm font-medium"
          >
            + 新增活动
          </Link>
          <button onClick={handleLogout} className="text-sm text-text-muted hover:text-text">
            退出登录
          </button>
        </div>
      </div>

      {/* 审核状态页签 + 批次过滤 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {REVIEW_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              tab === t.value ? "bg-neon-purple text-white" : "bg-bg-elevated text-text-muted hover:text-text"
            }`}
          >
            {t.label}（{tabCounts[t.value]}）
          </button>
        ))}
        {batches.length > 0 && (
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="ml-auto px-3 py-1.5 rounded-lg bg-bg-elevated text-sm text-text-muted border border-bg-elevated focus:border-neon-purple/50 outline-none"
          >
            <option value="all">全部批次</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                批次：{b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 批量操作条（超管） */}
      {isSuper && tab !== "approved" && selectableIds.length > 0 && (
        <div className="flex items-center gap-4 mb-4 px-4 py-3 rounded-lg bg-bg-card border border-bg-elevated">
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-neon-purple"
            />
            全选待审核（{selectableIds.length}）
          </label>
          <button
            onClick={handleBatchApprove}
            disabled={selected.size === 0 || batchSaving}
            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50"
          >
            {batchSaving ? "处理中…" : `批量通过（${selected.size}）`}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>{events.length === 0 ? "还没有任何活动" : "该条件下暂无活动"}</p>
          {events.length === 0 && (
            <Link href="/admin/events/new" className="text-neon-purple hover:underline text-sm mt-2 inline-block">
              创建第一个活动
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 bg-bg-card border border-bg-elevated rounded-lg px-4 py-3"
            >
              {isSuper && event.review_status === "pending" && (
                <input
                  type="checkbox"
                  checked={selected.has(event.id)}
                  onChange={() => toggleSelect(event.id)}
                  className="w-4 h-4 rounded accent-neon-purple flex-none"
                />
              )}
              {/* 海报缩略图 */}
              <div className="w-10 h-14 flex-none rounded overflow-hidden bg-bg-elevated">
                {event.poster_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={event.poster_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">无图</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate flex items-center gap-2 flex-wrap">
                  {event.is_anirox && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-neon-purple/20 text-neon-purple">AX</span>
                  )}
                  {event.is_featured && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400">精选推荐</span>
                  )}
                  {needsConfirm(event) && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400">待确认</span>
                  )}
                  <span className="truncate">{event.title}</span>
                </div>
                <div className="mt-0.5 text-xs text-text-muted flex items-center gap-2 flex-wrap">
                  <span>{event.date}</span>
                  <span>{event.city}</span>
                  <ReviewBadge status={event.review_status} />
                  {event.import_batch && <span className="text-text-muted/70">批次 {event.import_batch}</span>}
                  {event.review_status === "rejected" && event.review_note && (
                    <span className="text-red-400/80">驳回：{event.review_note}</span>
                  )}
                </div>
              </div>
              <div className="flex-none hidden sm:block">
                <StatusBadge status={event.status} />
              </div>
              <div className="flex-none flex flex-wrap gap-2 justify-end">
                {isSuper && (
                  <button
                    onClick={() => handleToggleRecommendation(event)}
                    disabled={recommendationSavingId === event.id}
                    className={`text-sm transition-colors disabled:opacity-50 ${
                      event.is_featured
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-text-muted hover:text-yellow-300"
                    }`}
                  >
                    {recommendationSavingId === event.id
                      ? "保存中"
                      : event.is_featured
                        ? "取消精选推荐"
                        : "推送精选推荐"}
                  </button>
                )}
                <Link
                  href={`/admin/events/${event.id}`}
                  className="text-sm text-neon-purple hover:text-neon-pink transition-colors"
                >
                  编辑
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };
  const labels: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };
  const key = status ?? "pending";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${styles[key] ?? "bg-gray-500/20 text-gray-400"}`}>
      {labels[key] ?? key}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ongoing: "bg-green-500/20 text-green-400",
    ended: "bg-gray-500/20 text-gray-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  const labels: Record<string, string> = { ongoing: "进行中", ended: "已结束", cancelled: "已取消" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
