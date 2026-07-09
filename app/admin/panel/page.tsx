import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPanelPage() {
  const session = await requireAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", session.user.id)
    .single();

  if (profile?.is_super_admin) {
    redirect("/admin/dashboard");
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, city, status, review_status")
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });

  const pending = (events ?? []).filter((e) => e.review_status === "pending");
  const rejected = (events ?? []).filter((e) => e.review_status === "rejected");
  const approved = (events ?? []).filter((e) => e.review_status === "approved");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">活动管理</h1>
          <p className="text-sm text-text-muted mt-1">录入活动 → 提交审核 → 通过后上线</p>
        </div>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm font-medium"
        >
          + 新活动
        </Link>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-yellow-400 mb-2">审核中 ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((ev) => (
              <div key={ev.id} className="bg-bg-card border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-text-muted">{ev.date} · {ev.city}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">待审核</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-400 mb-2">未通过 ({rejected.length})</h2>
          <div className="space-y-2">
            {rejected.map((ev) => (
              <div key={ev.id} className="bg-bg-card border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-text-muted">{ev.date} · {ev.city}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">未通过</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-green-400 mb-2">已通过 ({approved.length})</h2>
          <div className="space-y-2">
            {approved.map((ev) => (
              <div key={ev.id} className="bg-bg-card border border-bg-elevated rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-text-muted">{ev.date} · {ev.city}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">已上线</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events?.length === 0 && (
        <div className="bg-bg-card border border-bg-elevated rounded-xl p-10 text-center">
          <p className="text-text-muted">还没有活动，点击右上角创建</p>
        </div>
      )}
    </div>
  );
}
