import HeroSection from "@/components/home/HeroSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { getFeaturedEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedEvents();

  return (
    <>
      <HeroSection />
      <FeaturedCarousel events={featured} />
      <FeaturedEvents />
    </>
  );
}
