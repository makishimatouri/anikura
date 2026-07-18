import Link from "next/link";
import { Event, EVENT_TAG_LABELS } from "@/lib/types";
import AniROXBadge from "@/components/anirox/AniROXBadge";

function formatShort(dateStr: string): string {
  // date 为 YYYY-MM-DD，直接拆分避免时区偏移
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}.${Number(d)}`;
}

/** TIS 风活动卡：竖版 3:4 海报（轻微裁切）+ 黑色类型角标 + 紫色日期行 */
export default function EventCard({ event }: { event: Event }) {
  const image = event.poster_url || event.header_image_url;
  const primaryTag = event.tags[0];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-bg-card border border-bg-elevated rounded-xl overflow-hidden transition-all duration-300 hover:border-neon-purple/50 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] bg-bg-elevated relative overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/10 to-neon-pink/10">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        {primaryTag && (
          <span className="absolute top-3 left-3 bg-black/85 text-white text-[10px] tracking-[0.2em] px-2.5 py-1.5">
            {EVENT_TAG_LABELS[primaryTag]}
          </span>
        )}
        {event.is_anirox && (
          <div className="absolute top-3 right-3">
            <AniROXBadge />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-[11px] tracking-[0.18em] text-neon-purple font-en">
          {formatShort(event.date)} · {event.city}
        </p>
        <h3 className="mt-2 font-semibold leading-snug line-clamp-2 group-hover:text-neon-purple transition-colors">
          {event.title}
        </h3>
        <p className="mt-1.5 text-xs text-text-muted line-clamp-1">{event.venue}</p>
      </div>
    </Link>
  );
}
