/**
 * 业务时区日期工具：全站以 Asia/Shanghai 为「今天」的判定基准。
 * 服务端（Vercel, UTC）与客户端浏览器共用，避免 UTC 日期错位
 * （北京时间 00:00–08:00 时 toISOString() 取到的是前一天）。
 */

/** 当前上海时区的日历日期，格式 YYYY-MM-DD（可直接与 date 列比较） */
export function todayShanghai(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 相对今天偏移 n 天的上海时区日期（n 可为负），格式 YYYY-MM-DD */
export function shiftTodayShanghai(days: number): string {
  return new Date(Date.now() + days * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
