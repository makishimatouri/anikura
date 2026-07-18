import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/queries";
import { EVENT_TAG_LABELS } from "@/lib/types";
import PosterGallery from "@/components/events/PosterGallery";
import QQGroupButton from "@/components/events/QQGroupButton";
import AniROXBadge from "@/components/anirox/AniROXBadge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** YYYY-MM-DD → { dot: '2026.07.19', weekday: '周六' }；weekday 按 UTC 计算避免时区串日 */
function formatDateParts(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("zh-CN", {
    weekday: "short",
    timeZone: "UTC",
  });
  return { dot: `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`, weekday };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const { dot, weekday } = formatDateParts(event.date);
  const groups = event.qq_groups?.length
    ? event.qq_groups
    : event.qq_group
      ? [event.qq_group]
      : [];

  const infoRows: { en: string; label: string; value: string }[] = [
    { en: "DATE", label: "日期", value: `${dot} ${weekday}` },
    ...(event.start_time
      ? [{
          en: "TIME",
          label: "时间",
          value: event.end_time
            ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`
            : event.start_time.slice(0, 5),
        }]
      : []),
    { en: "CITY", label: "城市", value: event.city },
    { en: "VENUE", label: "场地", value: event.venue },
    ...(event.address ? [{ en: "ADDRESS", label: "详细地址", value: event.address }] : []),
    ...(event.ticket_price ? [{ en: "TICKET", label: "票价", value: event.ticket_price }] : []),
    ...(event.organizer ? [{ en: "ORGANIZER", label: "主办方", value: event.organizer }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-14">
      <Link
        href="/events"
        className="text-xs tracking-[0.25em] text-text-muted hover:text-neon-purple transition-colors"
      >
        ← <span className="font-en">EVENTS</span> 返回活动列表
      </Link>

      {/* 标题区：黑色类型角标 + 大字标题 + 紫色 meta 行 */}
      <header className="mt-10 text-center">
        <div className="flex justify-center gap-2 flex-wrap">
          {event.tags.map((tag) => (
            <span key={tag} className="bg-white text-black text-[10px] tracking-[0.2em] px-2.5 py-1.5">
              {EVENT_TAG_LABELS[tag]}
            </span>
          ))}
        </div>
        <h1 className="mt-6 font-display text-3xl md:text-5xl leading-tight tracking-wide">
          {event.title}
        </h1>
        {event.is_anirox && (
          <div className="mt-4 flex justify-center">
            <AniROXBadge />
          </div>
        )}
        <p className="mt-5 text-xs md:text-sm tracking-[0.3em] text-neon-purple font-en">
          {dot} {weekday} · {event.city} · {event.venue}
        </p>
      </header>

      {/* 主体：海报 + 信息面板 */}
      <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
        <PosterGallery
          posters={[event.poster_url, ...(event.poster_urls ?? [])].filter((u): u is string => !!u)}
          title={event.title}
        />

        <div>
          <dl>
            {infoRows.map((row) => (
              <div
                key={row.en}
                className="flex items-baseline justify-between gap-6 py-4 border-b border-bg-elevated"
              >
                <dt className="flex-none">
                  <span className="block font-display text-sm tracking-[0.2em]">{row.en}</span>
                  <span className="block mt-1 text-[10px] tracking-[0.25em] text-text-muted">{row.label}</span>
                </dt>
                <dd className="text-right text-sm leading-relaxed">{row.value}</dd>
              </div>
            ))}
          </dl>

          {event.ticket_link && (
            <a
              href={event.ticket_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block text-center px-6 py-3.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium tracking-widest hover:opacity-90 transition-opacity"
            >
              前往购票 →
            </a>
          )}

          {groups.length > 0 && (
            <div className="mt-8 space-y-3">
              <p className="text-[10px] tracking-[0.3em] text-text-muted">交流群</p>
              {groups.map((g) => (
                <QQGroupButton key={g} groupNumber={g} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 详情 */}
      {event.description && (
        <section className="mt-16 md:mt-20 max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl tracking-wider">DETAILS</h2>
            <p className="mt-2 text-[11px] tracking-[0.45em] text-text-muted">活 动 详 情</p>
            <div className="mx-auto mt-4 h-px w-11 bg-gradient-to-r from-neon-purple to-neon-pink" />
          </div>
          <div className="mt-8 text-text-muted leading-loose whitespace-pre-wrap">{event.description}</div>
        </section>
      )}
    </div>
  );
}
