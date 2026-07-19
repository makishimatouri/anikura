"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

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
  const [session, setSession] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadNotifs() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setSession(false);
      setLoading(false);
      return;
    }
    setSession(true);

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

  useEffect(() => {
    loadNotifs();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="NOTICE" cn="通 知" />
      </Reveal>

      <div className="mt-12 md:mt-14">
        {loading ? (
          <p className="text-center text-text-muted py-10">加载中…</p>
        ) : !session ? (
          <Reveal>
            <div className="text-center">
              <p className="text-text-muted mb-6">请先登录后查看通知</p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium"
              >
                去登录
              </Link>
            </div>
          </Reveal>
        ) : notifs.length === 0 ? (
          <Reveal>
            <div className="bg-bg-card border border-dashed border-bg-elevated rounded-xl p-10 text-center text-text-muted">
              暂无通知
            </div>
          </Reveal>
        ) : (
          <div className="space-y-3">
            {notifs.map((n) => (
              <Reveal key={n.id}>
                <div
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
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
