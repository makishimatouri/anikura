import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bg-elevated mt-20 py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-text-muted text-sm">
          <p>AniROX 厂牌 · Anikura CN 活动聚合</p>
          <p className="mt-1">© {new Date().getFullYear()} AniROX. All rights reserved.</p>
        </div>
        <div className="flex gap-6 text-sm text-text-muted">
          <Link href="/about" className="hover:text-text transition-colors">关于</Link>
          <Link href="/contact" className="hover:text-text transition-colors">联系</Link>
          <Link href="/events" className="hover:text-text transition-colors">活动</Link>
        </div>
      </div>
    </footer>
  );
}
