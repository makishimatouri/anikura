import Link from "next/link";
import { getUpcomingEvents } from "@/lib/queries";
import { Event } from "@/lib/types";
import SectionHead from "./SectionHead";
import Reveal from "@/components/ui/Reveal";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function UpcomingCard({ event }: { event: Event }) {
  const poster = event.poster_url || event.header_image_url;
  return (
    <Link
      href={`/events/${event.id}`}
      className="group w-40 flex-none snap-start md:w-52"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-bg-elevated bg-bg-card transition-colors group-hover:border-neon-purple/45">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon-purple/15 to-neon-pink/15">
            <span className="text-3xl opacity-60">🎵</span>
          </div>
        )}
        {event.is_anirox && (
          <span className="absolute left-2 top-2 bg-gradient-to-r from-neon-purple to-neon-pink px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">
            AniROX
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] tracking-[0.18em] text-neon-purple">
        {formatDate(event.date)} · {event.city}
      </p>
      <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-relaxed transition-colors group-hover:text-neon-purple">
        {event.title}
      </h3>
    </Link>
  );
}

/** 近期活动：TIS 风章节标题 + 横滑海报卡（TIS 会员个展横滑的矩形海报版） */
export default async function FeaturedEvents() {
  const upcoming = await getUpcomingEvents(10);

  if (upcoming.length === 0) return null;

  return (
    <section className="px-4 py-20 md:py-24">
      <Reveal>
        <SectionHead en="UPCOMING" cn="近 期 活 动" />
      </Reveal>
      <Reveal className="mt-12">
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x md:justify-center">
          {upcoming.map((event) => (
            <UpcomingCard key={event.id} event={event} />
          ))}
          <Link
            href="/events"
            className="flex w-40 flex-none snap-start items-center justify-center rounded-xl border border-dashed border-bg-elevated text-sm text-text-muted transition-colors hover:border-neon-purple/45 hover:text-neon-purple md:w-52"
          >
            查看全部活动 →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
