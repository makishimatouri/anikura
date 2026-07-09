"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Event } from "@/lib/types";

interface MobileHomeSectionsProps {
  recommendationEvents: Event[];
}

const NAV_SECTIONS = [
  "首页",
  "精选",
  "活动",
  "AniROX",
  "积分",
  "联系",
];

export default function MobileHomeSections({
  recommendationEvents,
}: MobileHomeSectionsProps) {
  const [active, setActive] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const event = recommendationEvents[currentEvent] ?? recommendationEvents[0];
  const posterImage = event?.poster_url || event?.header_image_url;

  const changeEvent = useCallback(() => {
    if (recommendationEvents.length <= 1) return;

    let nextIndex = currentEvent;
    while (nextIndex === currentEvent) {
      nextIndex = Math.floor(Math.random() * recommendationEvents.length);
    }
    setCurrentEvent(nextIndex);
  }, [currentEvent, recommendationEvents.length]);

  useEffect(() => {
    if (recommendationEvents.length <= 1) return;
    setCurrentEvent(Math.floor(Math.random() * recommendationEvents.length));
  }, [recommendationEvents.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = Number(visible?.target.getAttribute("data-mobile-section"));
        if (!Number.isNaN(index)) setActive(index);
      },
      { threshold: [0.45, 0.65, 0.85] }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="md:hidden relative h-[calc(100svh-3.5rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <div className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        {NAV_SECTIONS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" })}
            className={`h-2 rounded-full transition-all ${
              active === index ? "w-2 bg-neon-pink" : "w-1.5 bg-text-muted/35"
            }`}
            aria-label={`切换到${label}`}
          />
        ))}
      </div>

      <MobilePanel
        index={0}
        active={active}
        setRef={(node) => {
          sectionRefs.current[0] = node;
        }}
        title="ANIKURA CN"
        body="找活动、看厂牌、签到积分，都从这里进。"
        primaryHref="/events"
        primaryLabel="查看活动"
        secondaryHref="/anirox"
        secondaryLabel="AniROX"
        tone="from-neon-purple/18 via-bg to-neon-pink/14"
      />

      <section
        ref={(node) => {
          sectionRefs.current[1] = node;
        }}
        data-mobile-section={1}
        className="relative flex min-h-[calc(100svh-3.5rem)] snap-start snap-always flex-col justify-center overflow-hidden px-5 py-7"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-card/70 to-neon-blue/10" />
        <div
          className={`relative transition-all duration-700 ${
            active === 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-45"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-neon-pink">FEATURED</p>
              <h2 className="mt-2 text-3xl font-bold">精选推荐</h2>
            </div>
            <button
              type="button"
              onClick={changeEvent}
              disabled={recommendationEvents.length <= 1}
              className="shrink-0 rounded-full border border-neon-purple/40 px-4 py-2 text-sm font-medium text-neon-purple disabled:cursor-not-allowed disabled:border-bg-elevated disabled:text-text-muted/50"
            >
              换一个
            </button>
          </div>

          {event ? (
            <Link
              href={`/events/${event.id}`}
              className="block overflow-hidden rounded-xl border border-bg-elevated bg-bg-card"
              aria-label={`查看活动：${event.title}`}
            >
              <div className="flex h-[58svh] items-center justify-center bg-bg-elevated p-3">
                {posterImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={event.id}
                    src={posterImage}
                    alt={event.title}
                    className="max-h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-6xl opacity-50">♪</span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex h-[58svh] items-center justify-center rounded-xl border border-bg-elevated bg-bg-card px-8 text-center text-sm text-text-muted">
              暂无精选推荐活动
            </div>
          )}
        </div>
      </section>

      <MobilePanel
        index={2}
        active={active}
        setRef={(node) => {
          sectionRefs.current[2] = node;
        }}
        eyebrow="EVENTS"
        title="全国活动"
        body="按城市和类型浏览正在进行的动漫歌曲活动。"
        primaryHref="/events"
        primaryLabel="进入活动页"
        secondaryHref="/contact"
        secondaryLabel="提交活动"
        tone="from-neon-blue/16 via-bg to-neon-purple/14"
      />

      <MobilePanel
        index={3}
        active={active}
        setRef={(node) => {
          sectionRefs.current[3] = node;
        }}
        eyebrow="ANIROX"
        title="AniROX 专场"
        body="查看 AniROX 厂牌活动、合作企划和现场相关信息。"
        primaryHref="/anirox"
        primaryLabel="进入 AniROX"
        secondaryHref="/about"
        secondaryLabel="了解本站"
        tone="from-neon-pink/16 via-bg to-neon-purple/14"
      />

      <MobilePanel
        index={4}
        active={active}
        setRef={(node) => {
          sectionRefs.current[4] = node;
        }}
        eyebrow="POINTS"
        title="签到积分"
        body="每日签到、查看积分，也从这里进入。"
        primaryHref="/checkin"
        primaryLabel="去签到"
        secondaryHref="/points"
        secondaryLabel="看积分"
        tone="from-green-500/12 via-bg to-neon-blue/14"
      />

      <MobilePanel
        index={5}
        active={active}
        setRef={(node) => {
          sectionRefs.current[5] = node;
        }}
        eyebrow="INFO"
        title="通知与联系"
        body="查看站内通知，或联系维护方提交活动信息。"
        primaryHref="/notifications"
        primaryLabel="查看通知"
        secondaryHref="/contact"
        secondaryLabel="联系我们"
        tone="from-neon-purple/14 via-bg to-bg-card"
      />
    </div>
  );
}

function MobilePanel({
  index,
  active,
  setRef,
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  tone,
}: {
  index: number;
  active: number;
  setRef: (node: HTMLElement | null) => void;
  eyebrow?: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  tone: string;
}) {
  const isActive = active === index;

  return (
    <section
      ref={setRef}
      data-mobile-section={index}
      className="relative flex min-h-[calc(100svh-3.5rem)] snap-start snap-always items-center overflow-hidden px-5 py-8"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${tone}`} />
      <div
        className={`relative w-full transition-all duration-700 ${
          isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-45"
        }`}
      >
        {eyebrow && (
          <p className="text-xs font-medium tracking-[0.24em] text-neon-pink">{eyebrow}</p>
        )}
        <h2 className={`${eyebrow ? "mt-3" : ""} max-w-[11ch] text-5xl font-bold leading-tight`}>
          {title}
        </h2>
        <p className="mt-5 max-w-xs text-base leading-relaxed text-text-muted">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="rounded-full bg-gradient-to-r from-neon-purple to-neon-pink px-5 py-3 text-sm font-medium text-white"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="rounded-full border border-bg-elevated px-5 py-3 text-sm font-medium text-text-muted"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
