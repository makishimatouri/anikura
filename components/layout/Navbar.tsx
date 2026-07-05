import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/events", label: "活动" },
  { href: "/anirox", label: "AniROX" },
  { href: "/about", label: "关于" },
  { href: "/contact", label: "联系" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-bg-elevated">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
          Anikura 中国
        </Link>
        <ul className="flex items-center gap-1 md:gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-text-muted hover:text-text transition-colors px-3 py-2 rounded-md hover:bg-bg-elevated"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
