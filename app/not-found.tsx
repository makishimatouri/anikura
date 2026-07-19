import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="font-display text-[26vw] md:text-[11rem] leading-none bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-xs md:text-sm tracking-[0.45em] text-text-muted">页 面 未 找 到</p>
      <div className="mt-5 h-px w-11 bg-gradient-to-r from-neon-purple to-neon-pink" />
      <p className="mt-6 text-text-muted text-sm">你访问的页面可能已经过期或不存在</p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity"
      >
        返回首页
      </Link>
    </div>
  );
}
