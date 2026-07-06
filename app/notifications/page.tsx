"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
  }, []);

  async function loadNotifs() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifs(data ?? []);
    setLoading(false);

    // 自动标记全部已读
    if (data && data.some((n) => !n.is_read)) {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-text-muted">加载中…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">通知中心</h1>

      {notifs.length === 0 ? (
        <div className="bg-bg-card border border-bg-elevated rounded-xl p-10 text-center text-text-muted">
          暂无通知
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`bg-bg-card border rounded-xl p-4 transition-colors ${
                n.is_read ? "border-bg-elevated" : "border-neon-purple/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">
                  {n.type === "event_approved" ? "✅" : n.type === "event_rejected" ? "❌" : "📢"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  {n.message && (
                    <p className="text-sm text-text-muted mt-1 whitespace-pre-wrap">{n.message}</p>
                  )}
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(n.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-neon-purple flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
