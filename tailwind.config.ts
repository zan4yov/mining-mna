import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f0f2f8",
        surface: "#ffffff",
        inset: "#eef0f8",
        hover: "#e4e7f5",
        border: {
          DEFAULT: "#d4d8ee",
          subtle: "#e4e7f5",
        },
        "text-primary": "#0b0f2e",
        "text-muted": "#5a6080",
        "text-dim": "#8890b0",
        "text-faint": "#b8bdd4",
        primary: {
          DEFAULT: "#5c6bff",
          bg: "#5c6bff12",
          border: "#5c6bff30",
          dark: "#3d4fd4",
        },
        success: {
          DEFAULT: "#0ead69",
          bg: "#0ead6912",
          border: "#0ead6930",
        },
        warning: {
          DEFAULT: "#f59e0b",
          bg: "#f59e0b12",
          border: "#f59e0b30",
        },
        danger: {
          DEFAULT: "#ef4444",
          bg: "#ef444412",
          border: "#ef444430",
        },
        violet: "#8b5cf6",
        teal: "#14b8a6",
        orange: "#f97316",
        "exec-canvas": "#f5f7ff",
        "exec-surface": "#ffffff",
        "exec-inset": "#edf0fc",
        "exec-deep": "#e2e6f8",
        "exec-border": "#cdd3f0",
        "exec-text": "#090d28",
        "exec-muted": "#525a80",
        "exec-faint": "#a8b0d0",
        "exec-amber": "#e67e00",
        "exec-green": "#059652",
        "exec-red": "#dc2626",
        "exec-blue": "#2563eb",
        "exec-violet": "#7c3aed",
        "admin-canvas": "#fafbff",
        "admin-surface": "#ffffff",
        "admin-inset": "#f1f3ff",
        "admin-border": "#dde2f5",
        "admin-text": "#0c0f28",
        "admin-muted": "#5a6080",
        "admin-primary": "#7c3aed",
        "admin-bg": "#7c3aed12",
        "admin-border-a": "#7c3aed30",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "Courier New", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
