import Link from "next/link";
import { Event } from "@/lib/types";

interface HeroCollageProps {
  /** 最新收录活动（左下角 LATEST 条） */
  latest: Event | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 首屏 Hero：整屏暗色遮罩 + ANIKURA 字母镂空（SVG mask），
 * 透过字母直接看到底层持续滚动的海报墙；上滑掀开遮罩即完整海报墙。
 */
export default function HeroCollage({ latest }: HeroCollageProps) {
  const latestPoster = latest?.poster_url || latest?.header_image_url;

  return (
    <section className="relative h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* 镂空遮罩（桌面）：暗色整屏，字母区域透明 */}
      <svg
        className="absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="hero-cut-desktop">
            <rect width="1440" height="900" fill="#fff" />
            <text
              x="720"
              y="505"
              textAnchor="middle"
              fontFamily="Anton, sans-serif"
              fontSize="300"
              letterSpacing="12"
              fill="#000"
            >
              ANIKURA
            </text>
          </mask>
          <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="#08080c" mask="url(#hero-cut-desktop)" />
        <text
          x="720"
          y="505"
          textAnchor="middle"
          fontFamily="Anton, sans-serif"
          fontSize="300"
          letterSpacing="12"
          fill="none"
          stroke="url(#hero-edge)"
          strokeWidth="1.6"
          opacity="0.9"
        >
          ANIKURA
        </text>
      </svg>

      {/* 镂空遮罩（移动端） */}
      <svg
        className="absolute inset-0 h-full w-full md:hidden"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-edge-m" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
          <mask id="hero-cut-mobile">
            <rect width="390" height="844" fill="#fff" />
            <text
              x="195"
              y="472"
              textAnchor="middle"
              fontFamily="Anton, sans-serif"
              fontSize="82"
              letterSpacing="5"
              fill="#000"
            >
              ANIKURA
            </text>
          </mask>
        </defs>
        <rect width="390" height="844" fill="#08080c" mask="url(#hero-cut-mobile)" />
        <text
          x="195"
          y="472"
          textAnchor="middle"
          fontFamily="Anton, sans-serif"
          fontSize="82"
          letterSpacing="5"
          fill="none"
          stroke="url(#hero-edge-m)"
          strokeWidth="1.2"
          opacity="0.9"
        >
          ANIKURA
        </text>
      </svg>

      {/* 文案层 */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center">
        <div className="mt-[26vh] md:mt-[24vh]" />
        <p className="px-6 text-center text-sm md:text-base tracking-[0.35em] text-text/85">
          动漫歌曲 CLUB 活动聚合
        </p>
        <p className="mt-3 px-6 text-center font-en text-[10px] md:text-xs tracking-[0.42em] text-text-muted">
          CHINA ANIKURA EVENTS ARCHIVE · MAINTAINED BY ANIROX
        </p>
      </div>

      {latest && (
        <Link
          href={`/events/${latest.id}`}
          className="group absolute bottom-8 left-5 z-10 md:left-9 flex max-w-[72vw] items-center gap-4"
        >
          <span className="block h-14 w-14 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-full border border-bg-elevated">
            {latestPoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={latestPoster} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-bg-elevated text-xl">🎵</span>
            )}
          </span>
          <span>
            <span className="mb-1 block text-[10px] md:text-[11px] tracking-[0.22em] text-neon-purple">
              LATEST · {formatDate(latest.date)} · {latest.city}
            </span>
            <span className="block text-sm leading-relaxed group-hover:text-neon-purple transition-colors">
              {latest.title}
            </span>
          </span>
        </Link>
      )}

      <span className="hero-arrow absolute bottom-6 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
          <path d="M4 9l8 8 8-8" />
        </svg>
      </span>
    </section>
  );
}
