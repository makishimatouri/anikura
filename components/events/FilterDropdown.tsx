"use client";

import { useEffect, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  /** 英文主标签（Anton 展示字体） */
  en: string;
  /** 中文副标签 */
  cn: string;
  options: FilterOption[];
  /** 当前选中项的 value；'all' 表示未筛选 */
  value: string;
  /** value 为 'all' 时显示的占位文案 */
  allLabel: string;
  onPick: (value: string) => void;
}

/** TIS 风筛选下拉：EN 大标签 + 中文小字 + 当前值紫色 + 细线 + 三角 */
export default function FilterDropdown({ en, cn, options, value, allLabel, onPick }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);
  const currentLabel = value === "all" ? allLabel : (current?.label ?? allLabel);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left pb-3 border-b border-text/70 hover:border-neon-purple transition-colors"
      >
        <span className="flex items-start justify-between gap-2">
          <span>
            <span className="block font-display text-xl tracking-wider leading-none">{en}</span>
            <span className="block mt-1.5 text-[11px] tracking-[0.25em] text-text-muted">{cn}</span>
          </span>
          <span
            className={`mt-1 inline-block border-[5px] border-transparent border-t-current transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
        <span className={`block mt-2 text-xs tracking-widest ${value === "all" ? "text-text-muted" : "text-neon-purple"}`}>
          {currentLabel}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-lg border border-bg-elevated bg-bg-card shadow-xl shadow-black/50">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onPick(o.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "text-neon-purple bg-neon-purple/10"
                    : "text-text-muted hover:text-text hover:bg-bg-elevated"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
