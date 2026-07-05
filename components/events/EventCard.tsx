import Link from "next/link";
import { Event, EVENT_TAG_LABELS, EVENT_TAG_COLORS } from "@/lib/types";
import AniROXBadge from "@/components/anirox/AniROXBadge";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block group bg-bg-card border border-bg-elevated rounded-xl overflow-hidden hover:border-neon-purple/50 hover:shadow-lg hover:shadow-neon-purple/10 transition-all duration-300"
    >
      {/* 海报 */}
      <div className="aspect-[16/9] bg-bg-elevated relative overflow-hidden">
        {event.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-purple/10 to-neon-pink/10">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        {event.is_anirox && (
          <div className="absolute top-3 left-3">
            <AniROXBadge />
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{formatDate(event.date)}</span>
          <span>·</span>
          <span>{event.city}</span>
        </div>
        <h3 className="font-semibold text-text group-hover:text-neon-purple transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-text-muted">{event.venue}</p>
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs ${EVENT_TAG_COLORS[tag]}`}
              >
                {EVENT_TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
