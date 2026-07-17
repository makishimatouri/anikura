"use client";

import { useEffect, useState } from "react";

/**
 * 进入全站时的加载遮罩（TIS 风）：黑底 + 字距拉开的站名，约 1s 后淡出。
 * 每次完整加载都出现（与 TIS 一致）；站内 SPA 跳转不触发（layout 不重新挂载）。
 */
export default function LoadingCover() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="cover-fade fixed inset-0 z-[100] flex items-center justify-center bg-bg">
      <span className="cover-pulse font-display text-sm tracking-[0.5em] text-text-muted">
        ANIKURA&nbsp;CN
      </span>
    </div>
  );
}
