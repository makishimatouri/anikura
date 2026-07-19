import Link from "next/link";
import SectionHead from "@/components/home/SectionHead";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "关于 · Anikura CN",
  description: "关于 Anikura CN 活动聚合站和 AniROX 厂牌。",
};

const LINKS: Array<{ name: string; desc: string; url: string; icon: string }> = [];

function Block({
  en,
  cn,
  children,
}: {
  en: string;
  cn: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-4 border-b border-bg-elevated pb-3">
        <h2 className="font-display text-xl md:text-2xl tracking-wider">{en}</h2>
        <span className="text-xs tracking-[0.3em] text-text-muted">{cn}</span>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-14 pb-16 md:pt-20">
      <Reveal>
        <SectionHead en="ABOUT" cn="关 于 本 站" />
      </Reveal>

      <div className="mt-12 md:mt-16 space-y-14">
        <Reveal>
          <Block en="STATION" cn="关于本站">
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                Anikura CN 是一个聚合国内二次元音乐活动信息的非营利平台，
                由 <strong className="text-text">AniROX 厂牌</strong> 发起并维护。
              </p>
              <p>
                我们的目标是让分散在全国各地的 Anikura、Vocaloid、东方 Project 等
                二次元音乐活动有一个集中的展示窗口。无论你身处上海还是成都、广州还是武汉，
                都能在这里找到附近的活动信息。
              </p>
              <p>
                如果你有活动想要收录，欢迎
                <Link href="/contact" className="text-neon-purple hover:underline">联系我们</Link>。
              </p>
            </div>
          </Block>
        </Reveal>

        <Reveal>
          <Block en="AniROX" cn="关于厂牌">
            <div className="text-text-muted leading-relaxed space-y-4">
              <p>
                AniROX 是一家专注于二次元相关演出和漫展的组织与执行的厂牌。
                业务涵盖活动策划、艺人与乐队资源提供、演出活动报批、前期制作（约稿、宣传物料）、现场执行（调音、灯光、VJ）等。
              </p>
              <p>
                我们策划并主办 Anikura、Vocaloid 等各类主题的 DJ 派对与乐队音乐活动，
                为国内的二次元音乐爱好者带来沉浸式的动漫音乐体验。
              </p>
            </div>
          </Block>
        </Reveal>

        <Reveal>
          <Block en="LINKS" cn="友情链接">
            <p className="text-text-muted text-sm mb-4">与 AniROX 合作或相关的场地与品牌</p>
            {LINKS.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center bg-bg-card border border-dashed border-bg-elevated rounded-xl p-8">
                <p className="text-text-muted text-sm">友链合作开放中，敬请期待</p>
              </div>
            )}
          </Block>
        </Reveal>

        <Reveal>
          <Block en="CHANGELOG" cn="更新日志">
            <div className="space-y-4">
              <ChangelogItem
                date="2026-07-19"
                version="v0.3.3"
                items={[
                  "前端重构收官：全站页面统一 TIS 风版式",
                  "移动端整站验收与性能打磨",
                ]}
              />
              <ChangelogItem
                date="2026-07-18"
                version="v0.3.0"
                items={[
                  "首页重构：字母镂空 Hero + 三行无限海报墙",
                  "/events 列表页与活动详情页改版",
                  "注册确认邮件链路修复",
                ]}
              />
              <ChangelogItem
                date="2026-07-17"
                version="v0.2.0"
                items={[
                  "TIS 风全局骨架上线：抽屉菜单、加载遮罩、页面转场",
                  "自托管展示字体与设计地基",
                ]}
              />
              <ChangelogItem
                date="2026-07-09"
                version="v0.1.0"
                items={[
                  "Anikura CN 正式基线",
                  "全国活动聚合与筛选、签到积分、积分商城",
                  "QQ 一键加群、AniROX 厂牌专场",
                ]}
              />
            </div>
          </Block>
        </Reveal>
      </div>
    </div>
  );
}

function ChangelogItem({ date, version, items }: { date: string; version: string; items: string[] }) {
  return (
    <div className="bg-bg-card border border-bg-elevated rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="px-2.5 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-medium border border-neon-purple/30">
          {version}
        </span>
        <span className="text-xs text-text-muted">{date}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-text-muted flex items-start gap-2">
            <span className="text-neon-purple mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
