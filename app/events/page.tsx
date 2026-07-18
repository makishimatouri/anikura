import EventList from "@/components/events/EventList";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全国活动 · Anikura CN",
  description: "收录全国各地的 Anikura、Vocaloid、东方 Project 等二次元音乐活动",
};

interface PageProps {
  searchParams: Promise<{ city?: string; tag?: string; month?: string; q?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="max-w-6xl mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="EVENTS" cn="全 国 活 动" />
      </Reveal>
      <div className="mt-12 md:mt-16">
        <EventList city={params.city} tag={params.tag} month={params.month} q={params.q} />
      </div>
    </div>
  );
}
