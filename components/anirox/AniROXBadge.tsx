import Image from "next/image";

export default function AniROXBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 text-xs font-medium text-neon-purple border border-neon-purple/30">
      <Image src="/logo.png" alt="AniROX" width={14} height={14} className="w-3.5 h-3.5 brightness-0 invert" />
      AniROX
    </span>
  );
}
