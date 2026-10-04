import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d1d1f",
        paper: "#ffffff",
        panel: "#ffffff",
        line: "#d2d2d7",
        forest: {
          DEFAULT: "#0071e3",
          600: "#0077ed",
          800: "#0066cc",
        },
        rust: "#ff3b30",
        amber: "#ff9f0a",
        moss: "#34c759",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "var(--font-geist-sans)",
          "sans-serif",
        ],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        desk: "0 12px 40px -24px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
