import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 py-14 text-center">
      <p className="font-display text-2xl tracking-[0.15em] text-text">ANIKURA CN</p>
      <nav className="mt-5 flex items-center justify-center gap-6 text-xs text-text-muted">
        <Link href="/events" className="transition-colors hover:text-text">
          活动
        </Link>
        <Link href="/anirox" className="transition-colors hover:text-text">
          AniROX
        </Link>
        <Link href="/about" className="transition-colors hover:text-text">
          关于
        </Link>
        <Link href="/contact" className="transition-colors hover:text-text">
          联系
        </Link>
      </nav>
      <p className="mt-5 text-[11px] tracking-[0.2em] text-text-muted">
        © {new Date().getFullYear()} ANIROX · 动漫歌曲 CLUB 活动聚合
      </p>
    </footer>
  );
}
