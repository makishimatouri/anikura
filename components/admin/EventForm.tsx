"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Event, EventTag, EventStatus } from "@/lib/types";

const ALL_TAGS: EventTag[] = ["anikura", "bokakura", "touhou", "vocaloid", "game", "vtuber"];
const TAG_LABELS: Record<EventTag, string> = {
  anikura: "动漫歌曲",
  bokakura: "Vocaloid",
  touhou: "东方 Project",
  vocaloid: "Vocaloid",
  game: "游戏音乐",
  vtuber: "VTuber",
};

interface EventFormProps {
  initialData?: Event;
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    date: initialData?.date ?? "",
    start_time: initialData?.start_time ?? "",
    end_time: initialData?.end_time ?? "",
    city: initialData?.city ?? "",
    venue: initialData?.venue ?? "",
    tags: initialData?.tags ?? [] as EventTag[],
    poster_url: initialData?.poster_url ?? "",
    description: initialData?.description ?? "",
    ticket_price: initialData?.ticket_price ?? "",
    ticket_link: initialData?.ticket_link ?? "",
    organizer: initialData?.organizer ?? "",
    status: initialData?.status ?? "ongoing",
    is_anirox: initialData?.is_anirox ?? false,
    is_featured: initialData?.is_featured ?? false,
    qq_group: initialData?.qq_group ?? "",
    qq_group_name: initialData?.qq_group_name ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: EventTag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      updated_at: new Date().toISOString(),
    };

    const { error } = initialData
      ? await supabase.from("events").update(payload).eq("id", initialData.id)
      : await supabase.from("events").insert(payload);

    setLoading(false);

    if (error) {
      setError("保存失败：" + error.message);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}

      <FormField label="活动名称" required>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="form-input"
          placeholder="例如：Anikura 上海 Vol.12"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="活动日期" required>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="form-input"
          />
        </FormField>
        <FormField label="开始时间">
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
            className="form-input"
          />
        </FormField>
        <FormField label="结束时间">
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => update("end_time", e.target.value)}
            className="form-input"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="城市" required>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="form-input"
            placeholder="上海"
          />
        </FormField>
        <FormField label="场地" required>
          <input
            type="text"
            required
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
            className="form-input"
            placeholder="MAO Livehouse"
          />
        </FormField>
      </div>

      <FormField label="活动类型">
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                form.tags.includes(tag)
                  ? "bg-neon-purple text-white"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              {TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="活动描述">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="form-input min-h-[120px] resize-y"
          placeholder="活动简介、演出阵容等"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="票价">
          <input
            type="text"
            value={form.ticket_price}
            onChange={(e) => update("ticket_price", e.target.value)}
            className="form-input"
            placeholder="早鸟 ¥99 / 现场 ¥129"
          />
        </FormField>
        <FormField label="购票链接">
          <input
            type="url"
            value={form.ticket_link}
            onChange={(e) => update("ticket_link", e.target.value)}
            className="form-input"
            placeholder="https://..."
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="主办方">
          <input
            type="text"
            value={form.organizer}
            onChange={(e) => update("organizer", e.target.value)}
            className="form-input"
            placeholder="AniROX"
          />
        </FormField>
        <FormField label="状态">
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as EventStatus)}
            className="form-input"
          >
            <option value="ongoing">进行中</option>
            <option value="ended">已结束</option>
            <option value="cancelled">已取消</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="QQ群加群链接">
          <input
            type="url"
            value={form.qq_group}
            onChange={(e) => update("qq_group", e.target.value)}
            className="form-input"
            placeholder="https://qm.qq.com/q/..."
          />
        </FormField>
        <FormField label="QQ群名称">
          <input
            type="text"
            value={form.qq_group_name}
            onChange={(e) => update("qq_group_name", e.target.value)}
            className="form-input"
            placeholder="Anikura 上海交流群"
          />
        </FormField>
      </div>

      <FormField label="海报图片 URL">
        <input
          type="url"
          value={form.poster_url}
          onChange={(e) => update("poster_url", e.target.value)}
          className="form-input"
          placeholder="https://..."
        />
      </FormField>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_anirox}
            onChange={(e) => update("is_anirox", e.target.checked)}
            className="w-4 h-4 rounded accent-neon-purple"
          />
          AniROX 厂牌活动
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update("is_featured", e.target.checked)}
            className="w-4 h-4 rounded accent-neon-purple"
          />
          首页精选推荐
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "保存中…" : initialData ? "保存修改" : "创建活动"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="px-6 py-2.5 rounded-lg border border-bg-elevated text-text-muted hover:text-text transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-text-muted mb-1.5 block">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
