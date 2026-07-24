"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewPublishButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function reviewAndPublish() {
    if (!window.confirm(`确认审核并发布「${eventTitle}」？发布后活动将立即进入公开列表。`)) return;
    setSubmitting(true);
    setError("");
    const response = await fetch(`/api/admin/events/${eventId}/review-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setSubmitting(false);
    if (!response.ok) {
      setError("审核发布失败，活动状态没有改变。请刷新后重试。");
      return;
    }
    router.refresh();
  }

  return (
    <div className="border border-[#a855f7]/30 bg-[#a855f7]/[0.06] p-4 sm:p-5">
      <p className="font-en text-[10px] tracking-[0.18em] text-[#a855f7]">REVIEW COMMAND</p>
      <p className="mt-2 text-sm leading-6 text-[#aaa3b2]">该动作会原子写入发布状态、审核记录、审计日志及提交者通知。</p>
      <button
        type="button"
        disabled={submitting}
        onClick={reviewAndPublish}
        className="mt-4 min-h-11 w-full border border-[#a855f7] bg-[#a855f7] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9146da] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      >
        {submitting ? "发布中…" : "审核并发布"}
      </button>
      {error && <p role="alert" className="mt-3 text-xs leading-5 text-[#e19aaa]">{error}</p>}
    </div>
  );
}
