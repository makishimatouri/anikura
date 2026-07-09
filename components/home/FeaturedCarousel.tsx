"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Event, EventTag, EVENT_TAG_LABELS, EVENT_TAG_COLORS } from "@/lib/types";

interface FeaturedCarouselProps {
  events: Event[];
}

const DEMO_SLIDES = [
  {
    title: "Anikura 城市站 Vol.12",
    city: "待定",
    venue: "待定",
    date: "待定",
    tags: ["anikura"] as const,
    color: "from-purple-600/30 via-neon-purple/20 to-pink-600/30",
  },
  {
    title: "东方月光夜",
    city: "待定",
    venue: "待定",
    date: "待定",
    tags: ["touhou"] as const,
    color: "from-red-600/30 via-orange-500/20 to-yellow-500/30",
  },
  {
    title: "VocaLive 专场",
    city: "待定",
    venue: "待定",
    date: "待定",
    tags: ["vocaloid"] as const,
    color: "from-teal-500/30 via-cyan-500/20 to-blue-500/30",
  },
  {
    title: "AniROX 夏日祭",
    city: "待定",
    venue: "待定",
    date: "待定",
    tags: ["anikura", "game"] as EventTag[],
    is_anirox: true,
    color: "from-pink-600/30 via-neon-pink/20 to-purple-600/30",
  },
];

export default function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const swipedRef = useRef(false);

  // 用真实数据或 demo
  const slides = events.length > 0 ? events : DEMO_SLIDES;
  const isDemo = events.length === 0;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const resetTouch = useCallback(() => {
    touchStartRef.current = null;
    touchDeltaRef.current = { x: 0, y: 0 };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchDeltaRef.current = { x: 0, y: 0 };
    swipedRef.current = false;
    setPaused(true);
  }, [slides.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || slides.length <= 1) return;
    const touch = e.touches[0];
    touchDeltaRef.current = {
      x: touch.clientX - touchStartRef.current.x,
      y: touch.clientY - touchStartRef.current.y,
    };
  }, [slides.length]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || slides.length <= 1) {
      resetTouch();
      setPaused(false);
      return;
    }

    const { x, y } = touchDeltaRef.current;
    const horizontalSwipe = Math.abs(x) >= 48 && Math.abs(x) > Math.abs(y) * 1.2;

    if (horizontalSwipe) {
      swipedRef.current = true;
      if (x < 0) {
        next();
      } else {
        prev();
      }
      window.setTimeout(() => {
        swipedRef.current = false;
      }, 350);
    }

    resetTouch();
    setPaused(false);
  }, [next, prev, resetTouch, slides.length]);

  const handleSlideClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!swipedRef.current) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [paused, next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const event = slide as Event;
  const demoSlide = slide as typeof DEMO_SLIDES[0];
  const eventHeaderImage = event.header_image_url || event.poster_url;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">精选推荐</h2>
        {slides.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-bg-elevated text-text-muted hover:text-text hover:border-neon-purple/50 transition-colors flex items-center justify-center"
              aria-label="上一个"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-bg-elevated text-text-muted hover:text-text hover:border-neon-purple/50 transition-colors flex items-center justify-center"
              aria-label="下一个"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden bg-bg-card border border-bg-elevated select-none touch-pan-y"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          resetTouch();
          setPaused(false);
        }}
      >
        {isDemo ? (
          <div className="block">
            <div className={`aspect-[21/9] md:aspect-[21/7] bg-gradient-to-br ${demoSlide.color} flex items-center justify-center`}>
              <span className="text-5xl opacity-40">🎵</span>
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {"is_anirox" in demoSlide && demoSlide.is_anirox && (
                  <span className="px-2.5 py-1 rounded-full bg-neon-purple/15 text-xs font-medium text-neon-purple border border-neon-purple/30">
                    AniROX
                  </span>
                )}
                {demoSlide.tags.slice(0, 2).map((tag: EventTag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 rounded-full text-xs ${EVENT_TAG_COLORS[tag]}`}
                  >
                    {EVENT_TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{demoSlide.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                <span>📅 {demoSlide.date}</span>
                <span>📍 {demoSlide.city} · {demoSlide.venue}</span>
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/events/${event.id}`} className="block" onClick={handleSlideClick}>
            <div className="aspect-[21/9] md:aspect-[21/7] bg-bg-elevated">
              {eventHeaderImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={event.id}
                  src={eventHeaderImage}
                  alt={event.title}
                  className="w-full h-full object-cover animate-[fadeIn_0.5s_ease]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 via-bg to-neon-pink/20 flex items-center justify-center">
                  <span className="text-6xl opacity-50">🎵</span>
                </div>
              )}
            </div>
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                {event.is_anirox && (
                  <span className="px-2.5 py-1 rounded-full bg-neon-purple/15 text-xs font-medium text-neon-purple border border-neon-purple/30">
                    AniROX
                  </span>
                )}
                {event.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 rounded-full text-xs ${EVENT_TAG_COLORS[tag]}`}
                  >
                    {EVENT_TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                <span>📅 {event.date}</span>
                <span>📍 {event.city} · {event.venue}</span>
                {event.ticket_price && <span>🎫 {event.ticket_price}</span>}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* 指示器 */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-8 bg-gradient-to-r from-neon-purple to-neon-pink"
                  : "w-1.5 bg-bg-elevated hover:bg-text-muted/30"
              }`}
              aria-label={`第 ${idx + 1} 个`}
            />
          ))}
        </div>
      )}

      {isDemo && (
        <p className="text-center text-xs text-text-muted mt-3">演示数据 · 实际活动上线后自动替换</p>
      )}
    </section>
  );
}
