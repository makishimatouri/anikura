import Link from "next/link";
import { Event } from "@/lib/types";

interface HeroCollageProps {
  /** 用于字母拼贴的海报 URL（可为空，空时显示纯色字母） */
  posters: string[];
  /** 最新收录活动（左下角 LATEST 条） */
  latest: Event | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 首屏 Hero：ANIKURA 字母内填活动海报（SVG clipPath），
 * 缓慢平移 + 渐变描边，左下角最新收录条，底部滚动箭头。
 */
export default function HeroCollage({ posters, latest }: HeroCollageProps) {
  const band = posters.slice(0, 4);
  const latestPoster = latest?.poster_url || latest?.header_image_url;

  return (
    <section className="relative flex h-[calc(100svh-3.5rem)] min-h-[560px] flex-col items-center justify-center overflow-hidden">
      {/* 紫色氛围光 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[880px] max-w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-purple/10 blur-3xl" />

      <svg
        viewBox="0 0 1200 300"
        className="relative block h-auto w-[min(88vw,1150px)]"
        role="img"
        aria-label="ANIKURA"
      >
        <defs>
          <clipPath id="hero-letters">
            <text
              x="600"
              y="232"
              textAnchor="middle"
              fontFamily="Anton, sans-serif"
              fontSize="262"
              letterSpacing="10"
            >
              ANIKURA
            </text>
          </clipPath>
          <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <g clipPath="url(#hero-letters)">
          <g className="hero-band">
            {band.length === 0 ? (
              <rect x="0" y="0" width="1200" height="300" fill="#1e1e2a" />
            ) : (
              band.map((url, i) => {
                const w = 1200 / band.length;
                // 海报按 3:4 估算缩放高度，取中上段作为展示带
                const h = w * 1.414;
                return (
                  <image
                    key={url + i}
                    href={url}
                    x={i * w}
                    y={-h * 0.04}
                    width={w}
                    height={h}
                    preserveAspectRatio="xMidYMid slice"
                  />
                );
              })
            )}
          </g>
          <rect x="0" y="0" width="1200" height="300" fill="rgba(8,8,12,.1)" />
        </g>
        <text
          x="600"
          y="232"
          textAnchor="middle"
          fontFamily="Anton, sans-serif"
          fontSize="262"
          letterSpacing="10"
          fill="none"
          stroke="url(#hero-edge)"
          strokeWidth="1.4"
          opacity="0.9"
        >
          ANIKURA
        </text>
      </svg>

      <p className="relative mt-7 px-6 text-center text-sm md:text-base tracking-[0.35em] text-text/85">
        动漫歌曲 CLUB 活动聚合
      </p>
      <p className="relative mt-3 px-6 text-center font-en text-[10px] md:text-xs tracking-[0.42em] text-text-muted">
        CHINA ANIKURA EVENTS ARCHIVE · MAINTAINED BY ANIROX
      </p>

      {latest && (
        <Link
          href={`/events/${latest.id}`}
          className="group absolute bottom-8 left-5 md:left-9 flex max-w-[72vw] items-center gap-4"
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

      <span className="hero-arrow absolute bottom-6 left-1/2 -translate-x-1/2" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
          <path d="M4 9l8 8 8-8" />
        </svg>
      </span>
    </section>
  );
}
