import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0d0d12",
          card: "#16161f",
          elevated: "#1e1e2a",
        },
        neon: {
          purple: "#a855f7",
          pink: "#ec4899",
          blue: "#6366f1",
        },
        text: {
          DEFAULT: "#f0f0f5",
          muted: "#8a8a9a",
        },
      },
      fontFamily: {
        sans: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
