"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Event } from "@/lib/types";

interface RandomRecommendationProps {
  events: Event[];
}

export default function RandomRecommendation({ events }: RandomRecommendationProps) {
  const [current, setCurrent] = useState(0);
  const event = events[current] ?? events[0];
  const posterImage = event?.poster_url || event?.header_image_url;

  const changeEvent = useCallback(() => {
    if (events.length <= 1) return;

    let nextIndex = current;
    while (nextIndex === current) {
      nextIndex = Math.floor(Math.random() * events.length);
    }

    setCurrent(nextIndex);
  }, [current, events.length]);

  useEffect(() => {
    if (events.length <= 1) return;
    setCurrent(Math.floor(Math.random() * events.length));
  }, [events.length]);

  if (events.length === 0 || !event) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">精选推荐</h2>
        <button
          type="button"
          onClick={changeEvent}
          disabled={events.length <= 1}
          className="shrink-0 rounded-full border border-neon-purple/40 px-4 py-2 text-sm font-medium text-neon-purple transition-colors hover:border-neon-pink/60 hover:text-neon-pink disabled:cursor-not-allowed disabled:border-bg-elevated disabled:text-text-muted/50"
        >
          换一个
        </button>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="group block overflow-hidden rounded-2xl border border-bg-elevated bg-bg-card transition-colors hover:border-neon-purple/45"
        aria-label={`查看活动：${event.title}`}
      >
        <div className="flex min-h-[360px] items-center justify-center bg-bg-elevated p-3 sm:min-h-[520px] sm:p-5">
          {posterImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={event.id}
              src={posterImage}
              alt={event.title}
              className="max-h-[72vh] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/20 via-bg to-neon-pink/20">
              <span className="text-6xl opacity-50">🎵</span>
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}
