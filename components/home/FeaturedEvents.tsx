import { getFeaturedEvents, getUpcomingEvents } from "@/lib/queries";
import EventCard from "@/components/events/EventCard";

export default async function FeaturedEvents() {
  const featured = await getFeaturedEvents();
  const upcoming = await getUpcomingEvents(6);
  const displayEvents = featured.length > 0 ? featured : upcoming;

  if (displayEvents.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-2xl font-bold mb-6">
        {featured.length > 0 ? "精选活动" : "近期活动"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {displayEvents.length >= 6 && (
        <div className="mt-8 text-center">
          <a
            href="/events"
            className="text-neon-purple hover:text-neon-pink transition-colors text-sm"
          >
            查看全部活动 →
          </a>
        </div>
      )}
    </section>
  );
}
