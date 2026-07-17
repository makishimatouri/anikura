import HeroCollage from "@/components/home/HeroCollage";
import PosterWall from "@/components/home/PosterWall";
import RandomRecommendation from "@/components/home/RandomRecommendation";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import {
  getLatestApprovedEvent,
  getRecommendationEvents,
  getWallEvents,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestEvent, wallEvents, recommendationEvents] = await Promise.all([
    getLatestApprovedEvent(),
    getWallEvents(),
    getRecommendationEvents(),
  ]);

  const heroPosters = wallEvents
    .map((e) => e.poster_url)
    .filter((u): u is string => !!u)
    .slice(0, 4);

  return (
    <>
      <HeroCollage posters={heroPosters} latest={latestEvent} />
      <PosterWall events={wallEvents} />
      <FeaturedEvents />
      <RandomRecommendation events={recommendationEvents} />
    </>
  );
}
