import { supabase } from "./supabase";
import { todayShanghai } from "./date";
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
    .gte("date", todayShanghai())
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

/** 首页海报墙唯一数据源：有海报的已审核活动（不限 status；素材桶已退役，仅作备份） */
export async function getWallEvents(limit = 60): Promise<Event[]> {
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
