import HeroCollage from "@/components/home/HeroCollage";
import PosterWall from "@/components/home/PosterWall";
import RandomRecommendation from "@/components/home/RandomRecommendation";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import {
  getLatestApprovedEvent,
  getRecommendationEvents,
  getWallEvents,
  getWallPosters,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestEvent, wallEvents, wallPosters, recommendationEvents] = await Promise.all([
    getLatestApprovedEvent(),
    getWallEvents(),
    getWallPosters(),
    getRecommendationEvents(),
  ]);

  // Hero 字母拼贴：从海报墙素材里均匀抽 4 张，保证色彩风格打散
  const heroSource = wallPosters.length > 0
    ? wallPosters
    : wallEvents.map((e) => e.poster_url).filter((u): u is string => !!u);
  const heroPosters = heroSource.length <= 4
    ? heroSource
    : [0, 1, 2, 3].map((i) => heroSource[Math.floor((i * heroSource.length) / 4)]);

  const hasWall = wallPosters.length + wallEvents.filter((e) => e.poster_url).length > 0;

  return (
    <>
      {hasWall ? (
        // TIS 幕布结构：海报墙 sticky 钉在视口底层持续滚动，
        // Hero 以实底盖在上层，上滑掀开后露出海报墙，墙再随页面滚走
        <div className="relative">
          <div className="sticky top-14 z-0 h-[calc(100svh-3.5rem)]">
            <PosterWall events={wallEvents} posters={wallPosters} />
          </div>
          <div className="relative z-10 -mt-[calc(100svh-3.5rem)] bg-bg">
            <HeroCollage posters={heroPosters} latest={latestEvent} />
          </div>
          <div aria-hidden="true" className="h-[calc(100svh-3.5rem)]" />
        </div>
      ) : (
        <HeroCollage posters={heroPosters} latest={latestEvent} />
      )}
      <FeaturedEvents />
      <RandomRecommendation events={recommendationEvents} />
    </>
  );
}
