export type EventTag =
  | "anikura"
  | "bokakura"
  | "touhou"
  | "vocaloid"
  | "game"
  | "vtuber";

export type EventStatus = "ongoing" | "ended" | "cancelled";

export interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  city: string;
  venue: string;
  tags: EventTag[];
  poster_url: string | null;
  description: string | null;
  ticket_price: string | null;
  ticket_link: string | null;
  organizer: string | null;
  status: EventStatus;
  is_anirox: boolean;
  is_featured: boolean;
  qq_group: string | null;
  qq_group_name: string | null;
  created_at: string;
  updated_at: string;
}

export const EVENT_TAG_LABELS: Record<EventTag, string> = {
  anikura: "动漫歌曲",
  bokakura: "Vocaloid",
  touhou: "东方 Project",
  vocaloid: "Vocaloid",
  game: "游戏音乐",
  vtuber: "VTuber",
};

export const EVENT_TAG_COLORS: Record<EventTag, string> = {
  anikura: "bg-neon-purple/20 text-neon-purple",
  bokakura: "bg-neon-pink/20 text-neon-pink",
  touhou: "bg-red-500/20 text-red-400",
  vocaloid: "bg-teal-500/20 text-teal-400",
  game: "bg-neon-blue/20 text-neon-blue",
  vtuber: "bg-green-500/20 text-green-400",
};
