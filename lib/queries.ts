import { supabase } from "./supabase";
import { Event } from "./types";

export async function getFeaturedEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
    .eq("is_featured", true)
    .order("date", { ascending: true })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export async function getUpcomingEvents(limit = 9): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "ongoing")
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
    .single();

  if (error) return null;
  return data;
}

export async function getAniroxEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_anirox", true)
    .order("date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
