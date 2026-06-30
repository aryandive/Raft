import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "deep-midnight-blue": "#0f172a",
        "soft-cream": "#faf9f6",
        "soft-gold": "#c4a97f",
        "terracotta": "#e07a5f",
        "soft-indigo": "#818cf8",
        "sage-green": "#81b29a",
      },
      keyframes: {
        "organic-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8", filter: "blur(0px)" },
          "50%": { transform: "scale(1.6)", opacity: "0.4", filter: "blur(10px)" },
        },
      },
      animation: {
        "organic-breathe": "organic-breathe 16s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [typography],
};
export default config;
