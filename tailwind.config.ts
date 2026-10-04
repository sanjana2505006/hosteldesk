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
        ink: "#111827",
        paper: "#ffffff",
        panel: "#ffffff",
        line: "#e5e7eb",
        forest: {
          DEFAULT: "#0f7a4a",
          600: "#14915a",
          800: "#0c5c38",
        },
        rust: "#c24a1a",
        amber: "#b8862a",
        moss: "#5c7a48",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        desk: "0 8px 24px -16px rgba(17, 24, 39, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
