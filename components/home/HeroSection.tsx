export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-bg to-neon-pink/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/5 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent leading-tight">
          Anikura CN
        </h1>
        <p className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Anikura（アニクラ）即「动漫歌曲club活动」——DJ 播放动画金曲，VJ 同步投放动画画面。
          <br className="hidden md:block" />
          我们收录全国 Anikura、Vocaloid、东方 Project 等二次元音乐活动，亦可为各地主办提供前期的数调支持，本网站由 AniROX 厂牌维护。
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="/events"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-medium hover:opacity-90 transition-opacity"
          >
            查看活动
          </a>
          <a
            href="/anirox"
            className="px-6 py-3 rounded-full border border-bg-elevated text-text-muted hover:text-text hover:border-neon-purple/50 transition-all"
          >
            AniROX 专场
          </a>
        </div>
      </div>
    </section>
  );
}
