"use client";

import { useState } from "react";

interface QQGroupButtonProps {
  /** QQ 群号（纯数字），或历史遗留的完整加群链接（http 开头） */
  groupNumber: string;
}

/** 群号 → 各平台加群跳转：手机 QQ 打开群卡片，桌面 QQ 打开加群窗口 */
function buildJoinUrl(group: string): string {
  const clean = group.replace(/\D/g, "");
  if (/^https?:\/\//i.test(group)) return group; // 历史遗留完整链接直接沿用
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return mobile
    ? `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${clean}&card_type=group&source=qrcode`
    : `tencent://AddContact/?fromId=45&fromSubId=1&subcmd=all&uin=${clean}`;
}

export default function QQGroupButton({ groupNumber }: QQGroupButtonProps) {
  const [copied, setCopied] = useState(false);
  const isLegacyLink = /^https?:\/\//i.test(groupNumber);
  const displayNumber = isLegacyLink ? null : groupNumber.replace(/\D/g, "") || groupNumber;

  const handleJoin = () => {
    window.location.href = buildJoinUrl(groupNumber);
  };

  const handleCopy = async () => {
    if (!displayNumber) return;
    try {
      await navigator.clipboard.writeText(displayNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时静默
    }
  };

  return (
    <div className="flex items-center gap-3 bg-bg-card border border-bg-elevated rounded-xl p-4">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        💬
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">活动 QQ 群</p>
        <p className="text-xs text-text-muted truncate">
          {displayNumber ? (
            <>
              群号 {displayNumber}
              <button onClick={handleCopy} className="ml-2 text-neon-purple hover:text-neon-pink transition-colors">
                {copied ? "已复制" : "复制"}
              </button>
              <span className="ml-2 hidden sm:inline">跳转没反应就复制群号到 QQ 搜索</span>
            </>
          ) : (
            "点击按钮加入 QQ 群"
          )}
        </p>
      </div>
      <button
        onClick={handleJoin}
        className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
      >
        加入 QQ 群
      </button>
    </div>
  );
}
