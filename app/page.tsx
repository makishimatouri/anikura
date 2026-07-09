import HeroSection from "@/components/home/HeroSection";
import RandomRecommendation from "@/components/home/RandomRecommendation";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { getRecommendationEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recommendationEvents = await getRecommendationEvents();

  return (
    <>
      <HeroSection />
      <RandomRecommendation events={recommendationEvents} />
      <FeaturedEvents />
    </>
  );
}
