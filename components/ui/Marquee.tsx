import { CSSProperties, ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  /** 一轮滚动时长，默认 70s */
  duration?: number;
  /** 反向滚动（用于海报墙中间行） */
  reverse?: boolean;
  /** 悬停暂停，默认 true */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * 无限横向跑马灯（TIS 海报墙基础组件）。
 * 用法：children 传一组内容，组件内部自动复制一份首尾相接；
 * 外层容器需自行控制高度与 overflow。
 */
export default function Marquee({
  children,
  duration = 70,
  reverse = false,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  const classes = [
    "h-full",
    reverse ? "marquee-reverse" : "",
    pauseOnHover ? "marquee-pause-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex h-full shrink-0">{children}</div>
        <div className="flex h-full shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
