"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Reward {
  id: string;
  event_id: string | null;
  title: string;
  type: string;
  points_cost: number;
  description: string | null;
  discount_amount: string | null;
  stock: number | null;
  active: boolean;
  created_at: string;
  events: { title: string } | null;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState({
    event_id: "",
    title: "",
    type: "coupon",
    points_cost: 50,
    description: "",
    discount_amount: "",
    stock: "" as string | number,
    active: true,
  });

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
      fetchRewards();
      fetchEvents();
    });
  }, []);

  async function fetchRewards() {
    const { data } = await supabase
      .from("rewards")
      .select("*, events:title")
      .order("created_at", { ascending: false });
    setRewards(data ?? []);
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from("events")
      .select("id, title")
      .order("date", { ascending: false });
    setEvents(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      event_id: form.event_id || null,
      stock: form.stock === "" ? null : Number(form.stock),
    };
    const { error } = editing
      ? await supabase.from("rewards").update(payload).eq("id", editing.id)
      : await supabase.from("rewards").insert(payload);
    if (!error) {
      setShowForm(false);
      setEditing(null);
      resetForm();
      fetchRewards();
    }
  }

  function resetForm() {
    setForm({
      event_id: "",
      title: "",
      type: "coupon",
      points_cost: 50,
      description: "",
      discount_amount: "",
      stock: "",
      active: true,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除？")) return;
    await supabase.from("rewards").delete().eq("id", id);
    fetchRewards();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">奖品管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm font-medium"
        >
          + 新增奖品
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-bg-elevated rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-muted block mb-1.5">名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-input"
                  required
                  placeholder="如：减20元优惠券"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted block mb-1.5">类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="form-input"
                >
                  <option value="coupon">优惠券</option>
                  <option value="lottery_entry">抽奖名额</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted block mb-1.5">所需积分</label>
                <input
                  type="number"
                  min={1}
                  value={form.points_cost}
                  onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 1 })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-text-muted block mb-1.5">库存（空=不限）</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="form-input"
                  placeholder="不限"
                />
              </div>
              {form.type === "coupon" && (
                <div>
                  <label className="text-sm text-text-muted block mb-1.5">面额/描述</label>
                  <input
                    type="text"
                    value={form.discount_amount}
                    onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                    className="form-input"
                    placeholder="如：20元"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-text-muted block mb-1.5">关联活动（可选）</label>
                <select
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">不关联</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1.5">描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="form-input min-h-[60px] resize-y"
                placeholder="奖品说明"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded accent-neon-purple"
              />
              上架中
            </label>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 rounded-lg bg-neon-purple hover:bg-neon-purple/80 text-white text-sm font-medium">
                {editing ? "保存修改" : "创建"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 rounded-lg border border-bg-elevated text-text-muted text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {rewards.length === 0 && !showForm && (
          <p className="text-center text-text-muted py-12">还没有奖品，点击新增开始创建</p>
        )}
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-bg-card border border-bg-elevated rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-xl flex-shrink-0">
              {reward.type === "coupon" ? "🎟️" : "🎁"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{reward.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${reward.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                  {reward.active ? "上架" : "下架"}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {reward.points_cost} 积分
                {reward.events && ` · ${reward.events.title}`}
                {reward.stock !== null && ` · 库存 ${reward.stock}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(reward);
                  setShowForm(true);
                  setForm({
                    event_id: reward.event_id || "",
                    title: reward.title,
                    type: reward.type,
                    points_cost: reward.points_cost,
                    description: reward.description || "",
                    discount_amount: reward.discount_amount || "",
                    stock: reward.stock !== null ? String(reward.stock) : "",
                    active: reward.active,
                  });
                }}
                className="text-sm text-neon-purple hover:text-neon-pink"
              >
                编辑
              </button>
              <button onClick={() => handleDelete(reward.id)} className="text-sm text-red-400">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
