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
