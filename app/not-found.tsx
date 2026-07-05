import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">404</h1>
      <p className="mt-4 text-text-muted text-lg">页面未找到</p>
      <p className="mt-2 text-text-muted text-sm">你访问的页面可能已经过期或不存在</p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity"
      >
        返回首页
      </Link>
    </div>
  );
}
