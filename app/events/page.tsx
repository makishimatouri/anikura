import EventList from "@/components/events/EventList";

export const metadata = {
  title: "全国活动 · Anikura 中国",
  description: "收录全国各地的 Anikura、Vocaloid、东方 Project 等二次元音乐活动",
};

interface PageProps {
  searchParams: Promise<{ city?: string; tag?: string; month?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">活动列表</h1>
        <p className="mt-2 text-text-muted">全国二次元音乐活动汇总</p>
      </div>
      <EventList city={params.city} tag={params.tag} month={params.month} />
    </div>
  );
}
