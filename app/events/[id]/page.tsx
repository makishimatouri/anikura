import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/queries";
import { EVENT_TAG_LABELS, EVENT_TAG_COLORS } from "@/lib/types";
import PosterGallery from "@/components/events/PosterGallery";
import QQGroupButton from "@/components/events/QQGroupButton";
import AniROXBadge from "@/components/anirox/AniROXBadge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const formattedDate = new Date(event.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 返回 */}
      <Link href="/events" className="text-sm text-text-muted hover:text-text mb-6 inline-block">
        ← 返回活动列表
      </Link>

      {/* 海报画廊：主海报 + 同一活动的多版海报可切换，保留完整比例 */}
      <PosterGallery
        posters={[event.poster_url, ...(event.poster_urls ?? [])].filter((u): u is string => !!u)}
        title={event.title}
      />

      {/* 标题区 */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold flex-1">{event.title}</h1>
          {event.is_anirox && <AniROXBadge />}
        </div>
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span key={tag} className={`px-3 py-1 rounded-full text-xs ${EVENT_TAG_COLORS[tag]}`}>
              {EVENT_TAG_LABELS[tag]}
            </span>
          ))}
        </div>
      </div>

      {/* 信息网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <InfoItem label="日期" value={formattedDate} icon="📅" />
        {event.start_time && (
          <InfoItem
            label="时间"
            value={event.end_time ? `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}` : event.start_time.slice(0, 5)}
            icon="🕐"
          />
        )}
        <InfoItem label="城市" value={event.city} icon="📍" />
        <InfoItem label="场地" value={event.venue} icon="🏟️" />
        {event.ticket_price && <InfoItem label="票价" value={event.ticket_price} icon="🎫" />}
        {event.organizer && <InfoItem label="主办方" value={event.organizer} icon="👤" />}
      </div>

      {/* 描述 */}
      {event.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">活动详情</h2>
          <div className="text-text-muted leading-relaxed whitespace-pre-wrap">{event.description}</div>
        </div>
      )}

      {/* QQ 加群 */}
      {event.qq_group && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">交流群</h2>
          <QQGroupButton qqLink={event.qq_group} groupName={event.qq_group_name} />
        </div>
      )}

      {/* 购票 */}
      {event.ticket_link && (
        <a
          href={event.ticket_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity"
        >
          🎟️ 前往购票
        </a>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-bg-card border border-bg-elevated rounded-xl p-4 flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
