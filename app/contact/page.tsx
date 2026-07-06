export const metadata = {
  title: "联系我们 · Anikura CN",
  description: "联系 AniROX 厂牌，提交活动信息或商务合作。",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">联系我们</h1>
      <p className="text-text-muted leading-relaxed mb-8">
        如果你是活动主办方，想要将自己的 Anikura / 二次元音乐活动收录到本站，
        或者希望与 AniROX 厂牌进行商务合作、演出邀请，请通过以下方式联系我们。
      </p>

      <div className="space-y-6">
        <ContactCard
          icon="📮"
          title="活动提交"
          description="发送活动信息（标题、时间、地点、城市、主办方、购票链接）至邮箱"
          link="mailto:anirox@example.com"
          linkText="anirox@example.com"
        />
        <ContactCard
          icon="💬"
          title="QQ 联系"
          description="在 QQ 上联系 AniROX 工坊"
          link="#"
          linkText="QQ 号待填写"
        />
        <ContactCard
          icon="📷"
          title="社交媒体"
          description="关注 AniROX 的社交媒体获取最新动态"
          link="#"
          linkText="@anirox"
        />
      </div>

      <div className="mt-12 p-6 bg-bg-card border border-bg-elevated rounded-xl">
        <h3 className="font-semibold mb-2">提交活动时建议包含以下信息</h3>
        <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
          <li>活动名称与主题</li>
          <li>举办日期和时间</li>
          <li>详细地址和场地名</li>
          <li>城市</li>
          <li>类型标签（动漫歌曲 / Vocaloid / 东方 / 游戏 / VTuber）</li>
          <li>票价信息与购票链接</li>
          <li>主办方名称</li>
          <li>活动海报 (可选)</li>
          <li>QQ 群或微信群 (可选)</li>
        </ul>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  description,
  link,
  linkText,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-bg-card border border-bg-elevated rounded-xl p-5">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-text-muted mt-1">{description}</p>
        <a href={link} className="text-sm text-neon-purple hover:text-neon-pink transition-colors mt-2 inline-block">
          {linkText}
        </a>
      </div>
    </div>
  );
}
