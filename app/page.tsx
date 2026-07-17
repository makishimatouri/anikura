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

  return (
    <>
      <HeroCollage posters={heroPosters} latest={latestEvent} />
      <PosterWall events={wallEvents} posters={wallPosters} />
      <FeaturedEvents />
      <RandomRecommendation events={recommendationEvents} />
    </>
  );
}
