import { supabase } from "./supabase";
import { Event } from "./types";

export async function getFeaturedEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
    .eq("review_status", "approved")
    .eq("is_featured", true)
    .order("date", { ascending: true })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export async function getRecommendationEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
    .eq("review_status", "approved")
    .eq("is_featured", true)
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingEvents(limit = 9): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
    .eq("review_status", "approved")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("is_anirox", { ascending: false })
    .order("date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("review_status", "approved")
    .single();

  if (error) return null;
  return data;
}

export async function getAniroxEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_anirox", true)
    .eq("review_status", "approved")
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** 仅限管理员：获取所有活动（含未审核） */
export async function getAllEventsAdmin(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** 首页 Hero 最新收录：最新创建并已审核通过的活动 */
export async function getLatestApprovedEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("review_status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

/** 首页海报墙：有海报的已审核活动（不限是否进行中，未来海报文件夹接入前先用库里素材） */
export async function getWallEvents(limit = 12): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("review_status", "approved")
    .not("poster_url", "is", null)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

/**
 * 首页海报墙素材：wall-posters 公开桶内的海报 URL（东离提供的国内 anikura 海报集）。
 * 新桶没有公开 list 策略（anon 列目录返回空），服务端用 service role 列举；
 * 文件本身公开可读，key 不下发客户端。
 */
export async function getWallPosters(): Promise<string[]> {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wall-posters`;
  const apikey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/wall-posters`,
    {
      method: "POST",
      headers: {
        apikey,
        Authorization: `Bearer ${apikey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 200, prefix: "", sortBy: { column: "name", order: "asc" } }),
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return [];
  const files = (await res.json()) as { name: string }[];
  return files
    .map((f) => f.name)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .map((n) => `${base}/${n}`);
}
