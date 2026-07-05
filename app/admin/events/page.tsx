"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除这个活动？")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      fetchEvents();
    }
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

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>还没有任何活动</p>
          <Link href="/admin/events/new" className="text-neon-purple hover:underline text-sm mt-2 inline-block">
            创建第一个活动
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-text-muted font-medium">
            <div className="col-span-4">活动名称</div>
            <div className="col-span-2">日期</div>
            <div className="col-span-2">城市</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          {events.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center bg-bg-card border border-bg-elevated rounded-lg px-4 py-3"
            >
              <div className="md:col-span-4 font-medium truncate flex items-center gap-2">
                {event.is_anirox && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-neon-purple/20 text-neon-purple">AX</span>
                )}
                {event.is_featured && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400">精选</span>
                )}
                <span className="truncate">{event.title}</span>
              </div>
              <div className="md:col-span-2 text-sm text-text-muted">{event.date}</div>
              <div className="md:col-span-2 text-sm text-text-muted">{event.city}</div>
              <div className="md:col-span-2">
                <StatusBadge status={event.status} />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
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
