"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Event } from "@/lib/types";
import EventCard from "./EventCard";
import FilterDropdown, { FilterOption } from "./FilterDropdown";

const CITIES = ["上海", "北京", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "长沙", "其他"];

const TAG_OPTIONS: FilterOption[] = [
  { value: "all", label: "全部" },
  { value: "anikura", label: "动漫歌曲" },
  { value: "bokakura", label: "Vocaloid" },
  { value: "touhou", label: "东方" },
  { value: "game", label: "游戏音乐" },
  { value: "vtuber", label: "VTuber" },
];

interface EventBrowserProps {
  events: Event[];
  /** 当前生效的筛选（来自 URL），用于回显 */
  current: { city?: string | null; tag?: string | null; month?: string | null; q?: string | null };
  /** 月份选项由服务端按当前日期生成（含「过往活动」归档） */
  monthOptions: FilterOption[];
  /** 归档视图（month=past）下隐藏月份下拉，避免自相矛盾 */
  isPastView: boolean;
}

type SortMode = "date" | "random";

/** /events 列表的客户端交互区：计数牌 + 搜索 + 下拉筛选 + 排序切换 + 卡片网格 */
export default function EventBrowser({ events, current, monthOptions, isPastView }: EventBrowserProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [sort, setSort] = useState<SortMode>("date");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [q, setQ] = useState(current.q ?? "");

  const cityOptions: FilterOption[] = [
    { value: "all", label: "全部" },
    ...CITIES.map((c) => ({ value: c, label: c })),
  ];

  function pushParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "all" || v === "") next.delete(k);
      else next.set(k, v);
    });
    const qs = next.toString();
    router.push(qs ? `/events?${qs}` : "/events");
  }

  function submitSearch() {
    pushParams({ q: q.trim() || null });
  }

  const shown = useMemo(() => {
    if (sort !== "random") return events;
    // 每次点击「随机显示」用递增值触发重洗
    const arr = [...events];
    let seed = shuffleSeed || 1;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [events, sort, shuffleSeed]);

  const sortBtn = (mode: SortMode | "reset", label: string) => {
    const active = mode !== "reset" && sort === mode;
    return (
      <button
        type="button"
        onClick={() => {
          if (mode === "reset") {
            setSort("date");
            setQ("");
            router.push("/events");
            return;
          }
          setSort(mode);
          if (mode === "random") setShuffleSeed((s) => s + 1);
        }}
        className={`px-4 py-1 text-sm tracking-widest transition-colors ${
          active ? "text-neon-purple" : "text-text-muted hover:text-text"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      {/* 工具行：计数牌 + 搜索 */}
      <div className="flex items-stretch justify-between gap-6 mb-10">
        <div className="bg-neon-purple text-white px-6 py-4 flex flex-col justify-center min-w-[110px]">
          <span className="text-[10px] tracking-[0.3em] opacity-85">收录活动</span>
          <span className="font-display text-4xl leading-none mt-1.5">{events.length}</span>
        </div>
        <div className="flex-1 max-w-md self-center flex items-center gap-3 border-b border-bg-elevated focus-within:border-neon-purple transition-colors pb-2.5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            placeholder="SEARCH 搜活动 / 城市 / 主办"
            className="flex-1 bg-transparent outline-none text-sm tracking-widest placeholder:text-text-muted/70"
          />
          <button
            type="button"
            onClick={submitSearch}
            aria-label="搜索"
            className="text-text-muted hover:text-neon-purple transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 下拉筛选 */}
      <div className={`grid gap-8 mb-8 ${isPastView ? "grid-cols-2 max-w-xl" : "grid-cols-2 md:grid-cols-3"}`}>
        <FilterDropdown
          en="CITY"
          cn="城市"
          options={cityOptions}
          value={current.city ?? "all"}
          allLabel="全部"
          onPick={(v) => pushParams({ city: v })}
        />
        <FilterDropdown
          en="GENRE"
          cn="活动类型"
          options={TAG_OPTIONS}
          value={current.tag ?? "all"}
          allLabel="全部"
          onPick={(v) => pushParams({ tag: v })}
        />
        {!isPastView && (
          <FilterDropdown
            en="MONTH"
            cn="月份"
            options={monthOptions}
            value={current.month ?? "all"}
            allLabel="全部"
            onPick={(v) => pushParams({ month: v })}
          />
        )}
      </div>

      {/* 排序切换 */}
      <div className="flex justify-center items-center divide-x divide-bg-elevated mb-10">
        {sortBtn("random", "随机显示")}
        {sortBtn("date", "日期排序")}
        {sortBtn("reset", "重置")}
      </div>

      {/* 卡片网格 / 空态 */}
      {shown.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">{isPastView ? "暂无过往活动" : "该条件下暂无活动"}</p>
          {!isPastView && <p className="mt-2 text-sm">试试其他筛选条件，或者去提交一个新活动</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
          {shown.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
