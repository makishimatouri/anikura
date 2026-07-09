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
  header_image_url: string | null;
  poster_url: string | null;
  description: string | null;
  ticket_price: string | null;
  ticket_link: string | null;
  organizer: string | null;
  status: EventStatus;
  is_anirox: boolean;
  is_featured: boolean;
  has_lottery: boolean;
  lottery_points_cost: number;
  review_status: string | null;
  qq_group: string | null;
  qq_group_name: string | null;
  created_at: string;
  updated_at: string;
}

/** 管理员活动列表项（包含所有字段 + 审核状态） */
export interface AdminEvent extends Event {
  created_by: string | null;
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
