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
        ink: "#1c1915",
        paper: "#f3eee4",
        panel: "#fffdf8",
        line: "#d8cfc0",
        forest: {
          DEFAULT: "#2c4a3c",
          600: "#3d6b54",
          800: "#1d3228",
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
        desk: "0 18px 40px -24px rgba(28, 25, 21, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
