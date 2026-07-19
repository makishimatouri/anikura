import { getAniroxEvents } from "@/lib/queries";
import EventCard from "@/components/events/EventCard";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AniROX 专场 · Anikura CN",
  description: "AniROX 厂牌主办的二次元音乐活动，包括 Anikura DJ 派对、Vocaloid 专场等。",
};

export default async function AniROXPage() {
  const events = await getAniroxEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-14 pb-16 md:pt-20">
      {/* 厂牌页头：品牌时刻，紫粉渐变 */}
      <Reveal>
        <div className="text-center">
          <h1 className="font-display text-5xl md:text-7xl leading-none tracking-wide bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            AniROX
          </h1>
          <p className="mt-3 text-xs md:text-sm tracking-[0.45em] text-text-muted">厂 牌 专 场</p>
          <div className="mx-auto mt-5 h-px w-11 bg-gradient-to-r from-neon-purple to-neon-pink" />
          <div className="mx-auto mt-8 max-w-2xl text-text-muted leading-relaxed space-y-4 text-left md:text-center">
            <p>
              AniROX 是一家专注于二次元相关演出和漫展的组织与执行的厂牌。
              业务涵盖活动策划、艺人与乐队资源提供、演出活动报批、前期制作（约稿、宣传物料）、现场执行（调音、灯光、VJ）等。
            </p>
            <p>
              我们策划并主办 Anikura、Vocaloid 等各类主题的 DJ 派对与乐队音乐活动，
              为国内的二次元音乐爱好者带来沉浸式的动漫音乐体验。
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 md:mt-16">
        <FeaturedCarousel events={events} />
      </div>

      <Reveal>
        <div className="mt-14 md:mt-20">
          {events.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg">暂无 AniROX 活动</p>
              <p className="mt-2 text-sm">关注我们的社交账号获取最新活动信息</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
