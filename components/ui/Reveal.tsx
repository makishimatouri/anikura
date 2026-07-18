"use client";

import { ReactNode, useEffect, useRef } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 触发阈值，默认 0.15 */
  threshold?: number;
}

/**
 * 滚动淡入容器：进入视口时加 .reveal-on（配合 globals.css 的 .reveal-base）。
 * 只触发一次，离开后不回退。
 */
export default function Reveal({ children, className = "", threshold = 0.15 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-on");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal-base ${className}`}>
      {children}
    </div>
  );
}
