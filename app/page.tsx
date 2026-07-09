import HeroSection from "@/components/home/HeroSection";
import RandomRecommendation from "@/components/home/RandomRecommendation";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import MobileHomeSections from "@/components/home/MobileHomeSections";
import { getRecommendationEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recommendationEvents = await getRecommendationEvents();

  return (
    <>
      <MobileHomeSections recommendationEvents={recommendationEvents} />
      <div className="hidden md:block">
        <HeroSection />
        <RandomRecommendation events={recommendationEvents} />
        <FeaturedEvents />
      </div>
    </>
  );
}
