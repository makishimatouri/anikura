import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const BASE_URL = "https://www.anikura.cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/anirox`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, date, updated_at")
      .eq("review_status", "approved")
      .order("date", { ascending: false });

    if (!error && data) {
      eventRoutes = data.map((event) => ({
        url: `${BASE_URL}/events/${event.id}`,
        lastModified: event.updated_at ?? event.date,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // 查询失败时仍返回静态路由，保证 sitemap 可用
  }

  return [...staticRoutes, ...eventRoutes];
}
