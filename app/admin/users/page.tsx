"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
  total_points: number;
}

async function callAdminAPI(action: string, payload: Record<string, string>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "未登录" };
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "操作失败" };
  return json;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", session!.user.id)
        .single();
      if (!profile?.is_super_admin) {
        window.location.href = "/admin/events";
        return;
      }
      fetchUsers();
    });
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin, is_super_admin, total_points")
      .order("is_super_admin", { ascending: false })
      .order("is_admin", { ascending: false });
    if (!error) setUsers(data ?? []);
    setLoading(false);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminEmail) return;
    const res = await callAdminAPI("set_admin", { targetEmail: newAdminEmail });
    if (res.error) {
      alert("操作失败：" + res.error);
    } else {
      setNewAdminEmail("");
      fetchUsers();
    }
  }

  async function handleToggleAdmin(id: string, current: boolean) {
    const action = current ? "toggle_admin" : "set_admin_id";
    const res = await callAdminAPI(action, { targetId: id });
    if (res.error) alert("操作失败：" + res.error);
    else fetchUsers();
  }

  async function handleToggleSuper(id: string, current: boolean) {
    if (!current && !confirm("确认授予超级管理员权限？")) return;
    const res = await callAdminAPI(current ? "unset_super" : "set_super", { targetId: id });
    if (res.error) alert("操作失败：" + res.error);
    else fetchUsers();
  }

  if (loading) {
    return <div className="text-center py-12 text-text-muted">加载中…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">管理员管理</h1>

      <form onSubmit={handleAddAdmin} className="bg-bg-card border border-bg-elevated rounded-xl p-5 mb-8">
        <h2 className="font-semibold mb-3">添加管理员</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="form-input flex-1"
            placeholder="输入对方邮箱（需已注册）"
          />
          <button type="submit" className="px-5 py-2 rounded-lg bg-neon-purple text-white text-sm font-medium hover:bg-neon-purple/80">
            设为管理员
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          对方需要先注册账号，才能被设为管理员
        </p>
      </form>

      <div className="space-y-3">
        {users.length === 0 && (
          <div className="bg-bg-card border border-bg-elevated rounded-xl p-8 text-center text-text-muted">
            暂无用户数据
          </div>
        )}
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-bg-card border border-bg-elevated rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{u.email}</span>
                {u.is_super_admin && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                    超级管理员
                  </span>
                )}
                {u.is_admin && !u.is_super_admin && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                    管理员
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">积分 {u.total_points}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                disabled={u.is_super_admin}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  u.is_admin
                    ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                    : "border-bg-elevated text-text-muted hover:border-neon-purple/50"
                } ${u.is_super_admin ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {u.is_admin ? "取消管理" : "设为管理"}
              </button>
              <button
                onClick={() => handleToggleSuper(u.id, u.is_super_admin)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  u.is_super_admin
                    ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                    : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                }`}
              >
                {u.is_super_admin ? "取消超管" : "设超管"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
