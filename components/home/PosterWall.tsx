import Link from "next/link";
import Marquee from "@/components/ui/Marquee";
import { Event } from "@/lib/types";

interface PosterWallProps {
  events: Event[];
}

const ROW_DURATION = [66, 80, 72];
/** 每行磁贴数，不足用占位符补齐 */
const TILES_PER_ROW = 6;

const PLACEHOLDER_BG = [
  "linear-gradient(165deg,#1d1430,#0b0b11 70%)",
  "linear-gradient(165deg,#2a1220,#0b0b11 70%)",
  "linear-gradient(165deg,#101d2e,#0b0b11 70%)",
  "linear-gradient(165deg,#0f2426,#0b0b11 70%)",
  "linear-gradient(165deg,#26150f,#0b0b11 70%)",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function PosterTile({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="wall-tile relative block h-full flex-none overflow-hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={event.poster_url!} alt={event.title} loading="lazy" className="wall-tile-img" />
      <div className="wall-plate">
        <p className="text-[13px] font-semibold tracking-wide">{event.title}</p>
        <p className="mt-1 text-[10px] tracking-[0.18em] text-neon-purple">
          {formatDate(event.date)} · {event.city}
        </p>
      </div>
    </Link>
  );
}

function PlaceholderTile({ index }: { index: number }) {
  return (
    <Link
      href="/contact"
      className="wall-tile relative h-full aspect-[3/4] flex-none flex flex-col justify-between p-4 brightness-[.82] transition-[filter] hover:brightness-105"
      style={{ background: PLACEHOLDER_BG[index % PLACEHOLDER_BG.length] }}
    >
      <span className="font-display text-4xl leading-none opacity-90">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-[13px] font-semibold leading-relaxed tracking-wide text-text/90">
        ANIKURA CN
        <span className="mt-1 block text-[10px] font-normal tracking-[0.2em] text-text-muted">
          虚位以待 · 海报上墙请联系我们
        </span>
      </span>
    </Link>
  );
}

/**
 * 首页招牌：三行无限滚动海报墙。
 * 真实活动海报原比例展示（不裁切），不足部分用品牌占位符补齐。
 */
export default function PosterWall({ events }: PosterWallProps) {
  const withPoster = events.filter((e) => e.poster_url);
  const rows = Array.from({ length: 3 }, (_, row) => {
    const tiles = Array.from({ length: TILES_PER_ROW }, (_, i) => {
      const event = withPoster[(row * TILES_PER_ROW + i) % Math.max(withPoster.length, 1)];
      const useEvent = withPoster.length > 0 && i < Math.max(withPoster.length, 1);
      return { event: useEvent ? event : null, key: `${row}-${i}` };
    });
    return tiles;
  });

  if (withPoster.length === 0) return null;

  return (
    <section aria-label="活动海报墙" className="flex flex-col md:h-[calc(100svh-3.5rem)] md:min-h-[560px]">
      {rows.map((tiles, row) => (
        <div
          key={row}
          className="wall-row h-[60vw] overflow-hidden md:h-auto md:flex-1"
        >
          <Marquee duration={ROW_DURATION[row]} reverse={row === 1}>
            {tiles.map((tile) =>
              tile.event ? (
                <PosterTile key={tile.key} event={tile.event} />
              ) : (
                <PlaceholderTile key={tile.key} index={row * TILES_PER_ROW + Number(tile.key.split("-")[1])} />
              )
            )}
          </Marquee>
        </div>
      ))}
    </section>
  );
}
