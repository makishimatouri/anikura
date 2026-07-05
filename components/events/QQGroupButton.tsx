"use client";

interface QQGroupButtonProps {
  qqLink: string;
  groupName?: string | null;
}

export default function QQGroupButton({ qqLink, groupName }: QQGroupButtonProps) {
  const handleClick = () => {
    window.location.href = qqLink;
  };

  return (
    <div className="flex items-center gap-3 bg-bg-card border border-bg-elevated rounded-xl p-4">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        💬
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{groupName || "活动 QQ 群"}</p>
        <p className="text-xs text-text-muted truncate">点击按钮加入 QQ 群</p>
      </div>
      <button
        onClick={handleClick}
        className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
      >
        加入 QQ 群
      </button>
    </div>
  );
}
