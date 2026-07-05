import { getAniroxEvents } from "@/lib/queries";
import EventCard from "@/components/events/EventCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AniROX 专场 · Anikura 中国",
  description: "AniROX 厂牌主办的二次元音乐活动，包括 Anikura DJ 派对、Vocaloid 专场等。",
};

export default async function AniROXPage() {
  const events = await getAniroxEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 text-sm mb-4">
          <svg className="w-4 h-4 text-neon-purple" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AniROX 厂牌
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">AniROX 厂牌活动</h1>
        <p className="mt-3 text-text-muted max-w-2xl leading-relaxed">
          AniROX 专注二次元相关演出和漫展的组织与执行。
          我们策划并主办 Anikura、Vocaloid、东方 Project 等主题的 DJ 派对和音乐活动，
          为国内的二次元音乐爱好者带来沉浸式的动漫音乐体验。
        </p>
      </div>

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
