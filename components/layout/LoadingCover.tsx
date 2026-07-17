"use client";

import { useEffect, useState } from "react";

/**
 * 首次进入全站时的加载遮罩（TIS 风）：黑底 + 字距拉开的站名，约 1s 后淡出。
 * 同一次会话只出现一次，后续站内跳转不再遮挡。
 */
export default function LoadingCover() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("acn-cover-seen")) return;
    sessionStorage.setItem("acn-cover-seen", "1");
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
