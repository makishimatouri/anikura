"use client";

import { useState } from "react";

interface PosterGalleryProps {
  /** 全部海报 URL，第一张为主海报 */
  posters: string[];
  title: string;
}

/** 活动详情页海报画廊：主海报大图 + 多版本缩略图切换（无额外海报时退化为单图） */
export default function PosterGallery({ posters, title }: PosterGalleryProps) {
  const [active, setActive] = useState(0);
  if (posters.length === 0) return null;
  const current = posters[Math.min(active, posters.length - 1)];

  return (
    <div className="mb-6">
      <div className="rounded-xl overflow-hidden bg-bg-elevated border border-bg-elevated">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={title} className="w-full h-auto object-contain" />
      </div>
      {posters.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {posters.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`海报版本 ${i + 1}`}
              className={`flex-none rounded-lg overflow-hidden border transition-all ${
                i === active
                  ? "border-neon-purple ring-1 ring-neon-purple"
                  : "border-bg-elevated opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-auto object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
