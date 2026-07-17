interface SectionHeadProps {
  /** 英文大标题（Anton 展示字体） */
  en: string;
  /** 中文小字副标题 */
  cn: string;
}

/** TIS 风章节标题：巨大英文 + 中文小字 + 紫色短划线 */
export default function SectionHead({ en, cn }: SectionHeadProps) {
  return (
    <div className="text-center">
      <h2 className="font-display text-5xl md:text-7xl leading-none tracking-wide">{en}</h2>
      <p className="mt-3 text-xs md:text-sm tracking-[0.45em] text-text-muted">{cn}</p>
      <div className="mx-auto mt-5 h-px w-11 bg-gradient-to-r from-neon-purple to-neon-pink" />
    </div>
  );
}
