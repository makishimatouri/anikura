import { getAniroxEvents } from "@/lib/queries";
import EventCard from "@/components/events/EventCard";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AniROX 专场 · Anikura CN",
  description: "AniROX 厂牌主办的二次元音乐活动，包括 Anikura DJ 派对、Vocaloid 专场等。",
};

export default async function AniROXPage() {
  const events = await getAniroxEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 text-sm mb-4">
          <img src="/logo.png" alt="AniROX" className="h-4 w-auto brightness-0 invert" />
          AniROX 厂牌
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">AniROX 厂牌活动</h1>
        <p className="mt-3 text-text-muted max-w-2xl leading-relaxed">
          AniROX 是一家专注于二次元相关演出和漫展的组织与执行的厂牌。
          业务涵盖活动策划、艺人与乐队资源提供、演出活动报批、前期制作（约稿、宣传物料）、现场执行（调音、灯光、 VJ）等。
        </p>
        <p className="mt-3 text-text-muted max-w-2xl leading-relaxed">
          AniROX 专注二次元相关演出和漫展的组织与执行。我们策划并主办 Anikura、Vocaloid等各类主题的 DJ 派对与乐队音乐活动，为国内的二次元音乐爱好者带来沉浸式的动漫音乐体验。
        </p>
      </div>

      <FeaturedCarousel events={events} />

      {events.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">暂无 AniROX 活动</p>
          <p className="mt-2 text-sm">关注我们的社交账号获取最新活动信息</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
