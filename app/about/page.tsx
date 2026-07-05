import Link from "next/link";

export const metadata = {
  title: "关于 · Anikura 中国",
  description: "关于 Anikura 中国活动聚合站和 AniROX 厂牌。",
};

const LINKS = [
  {
    name: "香蕉邦戈",
    desc: "御宅酒吧 · 小型活动场地",
    url: "#",
    icon: "🍌",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">关于本站</h1>
        <div className="text-text-muted leading-relaxed space-y-4">
          <p>
            Anikura 中国是一个聚合国内二次元音乐活动信息的非营利平台，
            由 <strong>AniROX 厂牌</strong> 发起并维护。
          </p>
          <p>
            我们的目标是让分散在全国各地的 Anikura、Vocaloid、东方 Project 等
            二次元音乐活动有一个集中的展示窗口。无论你身处上海还是成都、广州还是武汉，
            都能在这里找到附近的活动信息。
          </p>
          <p>
            如果你有活动想要收录，欢迎<Link href="/contact" className="text-neon-purple hover:underline">联系我们</Link>。
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">关于 AniROX</h2>
        <div className="text-text-muted leading-relaxed space-y-3">
          <p>
            AniROX 是一家专注于二次元相关演出和漫展的组织与执行的厂牌。
            业务涵盖活动策划、前期制作（约稿、宣传物料）、现场执行（调音、灯光、 VJ）。
          </p>
          <p>
            AniROX 长期主办 Anikura、Vocaloid 主题 DJ 派对等二次元音乐活动，
            是国内 Anikura 文化传播的重要参与者。
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">友情链接</h2>
        <p className="text-text-muted text-sm mb-4">与 AniROX 合作或相关的场地与品牌</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LINKS.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-bg-card border border-bg-elevated rounded-xl p-4 hover:border-neon-purple/50 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
