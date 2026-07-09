"use client";

import { useState, useEffect } from "react";
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
  isSuper?: boolean;
}

export default function EventForm({ initialData, isSuper = false }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
  }, []);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    date: initialData?.date ?? "",
    start_time: initialData?.start_time ?? "",
    end_time: initialData?.end_time ?? "",
    city: initialData?.city ?? "",
    venue: initialData?.venue ?? "",
    tags: initialData?.tags ?? [] as EventTag[],
    header_image_url: initialData?.header_image_url ?? "",
    poster_url: initialData?.poster_url ?? "",
    description: initialData?.description ?? "",
    ticket_price: initialData?.ticket_price ?? "",
    ticket_link: initialData?.ticket_link ?? "",
    organizer: initialData?.organizer ?? "",
    status: initialData?.status ?? "ongoing",
    is_anirox: initialData?.is_anirox ?? false,
    is_featured: initialData?.is_featured ?? false,
    has_lottery: initialData?.has_lottery ?? false,
    lottery_points_cost: initialData?.lottery_points_cost ?? 30,
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

  async function uploadImage(file: File, prefix: "headers" | "posters") {
    if (file.size > 5 * 1024 * 1024) {
      alert("图片过大，请上传 5MB 以内的文件");
      return null;
    }

    setLoading(true);
    const ext = file.name.split(".").pop();
    const filename = `${prefix}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(filename, file);

    setLoading(false);

    if (uploadError) {
      alert("上传失败：" + uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("posters")
      .getPublicUrl(filename);
    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const headerImageValue = form.header_image_url.trim() || null;
    const payload = {
      ...form,
      header_image_url: undefined as string | null | undefined,
      poster_url: form.poster_url.trim() || null,
      review_status: isSuper ? "approved" : "pending",
      updated_at: new Date().toISOString(),
    };
    if (headerImageValue || initialData?.header_image_url !== undefined) {
      payload.header_image_url = headerImageValue;
    }

    const { error } = initialData
      ? await supabase.from("events").update(payload).eq("id", initialData.id)
      : await supabase.from("events").insert({ ...payload, created_by: userId });

    setLoading(false);

    if (error) {
      if (error.message.includes("header_image_url")) {
        setError("保存失败：数据库还没有添加头图字段 header_image_url。请先在 Supabase SQL Editor 执行仓库里的 supabase/migrations/20260709_add_event_header_image.sql。");
        return;
      }
      setError("保存失败：" + error.message);
      return;
    }

    const redirectTo = isSuper ? "/admin/dashboard" : "/admin/panel";
    router.push(redirectTo);
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

      <ImageUploadField
        label="头图图片（可选）"
        helpText="推荐 16:9 或 21:9 横图，建议至少 1600×900。用于横向活动卡片和 AniROX 展示；不上传时会自动裁剪海报作为头图展示。首页随机推荐使用主海报原图。"
        value={form.header_image_url}
        previewClassName="aspect-[16/9] object-cover"
        onChange={(value) => update("header_image_url", value)}
        onUpload={async (file) => {
          const url = await uploadImage(file, "headers");
          if (url) update("header_image_url", url);
        }}
      />

      <FormField label="海报图片">
        <div className="space-y-3">
          {form.poster_url && (
            <div className="w-full max-w-sm rounded-lg overflow-hidden bg-bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.poster_url} alt="预览" className="w-full h-auto object-contain" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 rounded-lg border border-bg-elevated text-text-muted hover:border-neon-purple/50 hover:text-text transition-colors text-sm">
              上传图片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadImage(file, "posters");
                  if (url) update("poster_url", url);
                }}
              />
            </label>
            {form.poster_url && (
              <button
                type="button"
                onClick={() => update("poster_url", "")}
                className="text-xs text-red-400 hover:text-red-300"
              >
                移除
              </button>
            )}
            <span className="text-xs text-text-muted">或粘贴图片链接。详情页会展示完整海报原图，不裁剪。</span>
          </div>
          <input
            type="url"
            value={form.poster_url}
            onChange={(e) => update("poster_url", e.target.value)}
            className="form-input"
            placeholder="https://..."
          />
        </div>
      </FormField>

      {isSuper && (
        <div className="rounded-xl border border-bg-elevated bg-bg-card/60 p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">超管运营设置</h2>
            <p className="text-xs text-text-muted mt-1">
              首页随机推荐只会从已审核通过、状态为进行中，并勾选推荐的活动中抽取。
            </p>
          </div>
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
              推送至随机推荐
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.has_lottery}
                onChange={(e) => update("has_lottery", e.target.checked)}
                className="w-4 h-4 rounded accent-neon-purple"
              />
              开启积分抽奖
            </label>
          </div>

          {form.has_lottery && (
            <FormField label="抽奖所需积分">
              <input
                type="number"
                min={1}
                value={form.lottery_points_cost}
                onChange={(e) => update("lottery_points_cost", parseInt(e.target.value) || 30)}
                className="form-input"
                placeholder="30"
              />
            </FormField>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-4 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "保存中…" : initialData ? "保存修改" : "创建活动"}
        </button>
        {isSuper && initialData && initialData.review_status === "pending" && (
          <>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("确认通过该活动？")) return;
                await supabase.from("events").update({ review_status: "approved" }).eq("id", initialData.id);
                router.push("/admin/dashboard");
                router.refresh();
              }}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500"
            >
              审核通过
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("确认拒绝该活动？")) return;
                await supabase.from("events").update({ review_status: "rejected" }).eq("id", initialData.id);
                router.push("/admin/dashboard");
                router.refresh();
              }}
              className="px-6 py-2.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              拒绝
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => router.push(isSuper ? "/admin/dashboard" : "/admin/panel")}
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

function ImageUploadField({
  label,
  helpText,
  value,
  previewClassName,
  onChange,
  onUpload,
}: {
  label: string;
  helpText: string;
  value: string;
  previewClassName: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <FormField label={label}>
      <div className="space-y-3">
        <p className="text-xs text-text-muted leading-relaxed">{helpText}</p>
        {value && (
          <div className="w-full max-w-sm rounded-lg overflow-hidden bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="预览" className={`w-full ${previewClassName}`} />
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer px-4 py-2 rounded-lg border border-bg-elevated text-text-muted hover:border-neon-purple/50 hover:text-text transition-colors text-sm">
            上传图片
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await onUpload(file);
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              移除
            </button>
          )}
          <span className="text-xs text-text-muted">或粘贴图片链接</span>
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input"
          placeholder="https://..."
        />
      </div>
    </FormField>
  );
}
