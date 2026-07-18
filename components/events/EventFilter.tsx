"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CITIES = ["全部", "上海", "北京", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "长沙", "其他"];
const TAGS = [
  { value: "all", label: "全部" },
  { value: "anikura", label: "动漫歌曲" },
  { value: "bokakura", label: "Vocaloid" },
  { value: "touhou", label: "东方" },
  { value: "game", label: "游戏音乐" },
  { value: "vtuber", label: "VTuber" },
];
const MONTHS = [
  { value: "all", label: "全部月份" },
  { value: "2026-07", label: "2026年7月" },
  { value: "2026-08", label: "2026年8月" },
  { value: "2026-09", label: "2026年9月" },
  { value: "2026-10", label: "2026年10月" },
  { value: "2026-11", label: "2026年11月" },
  { value: "2026-12", label: "2026年12月" },
  { value: "past", label: "过往活动" },
];

export default function EventFilter() {
  const router = useRouter();
  const params = useSearchParams();

  function updateFilter(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());
    if (value === "all" || value === "全部") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    router.push(`/events?${newParams.toString()}`);
  }

  return (
    <div className="space-y-4 mb-8">
      {/* 城市筛选 */}
      <div>
        <label className="text-xs text-text-muted mb-2 block">城市</label>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => {
            const isActive = city === "全部" ? !params.get("city") : params.get("city") === city;
            return (
              <button
                key={city}
                onClick={() => updateFilter("city", city)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-neon-purple text-white"
                    : "bg-bg-elevated text-text-muted hover:text-text"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* 类型筛选 */}
      <div>
        <label className="text-xs text-text-muted mb-2 block">活动类型</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isActive = tag.value === "all" ? !params.get("tag") : params.get("tag") === tag.value;
            return (
              <button
                key={tag.value}
                onClick={() => updateFilter("tag", tag.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-neon-pink text-white"
                    : "bg-bg-elevated text-text-muted hover:text-text"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 月份筛选 */}
      <div>
        <label className="text-xs text-text-muted mb-2 block">月份</label>
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((month) => {
            const isActive = month.value === "all" ? !params.get("month") : params.get("month") === month.value;
            return (
              <button
                key={month.value}
                onClick={() => updateFilter("month", month.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive
                    ? "bg-neon-blue text-white"
                    : "bg-bg-elevated text-text-muted hover:text-text"
                }`}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
