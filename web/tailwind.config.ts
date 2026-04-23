import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          0: "rgb(var(--ink-0) / <alpha-value>)",
          50: "rgb(var(--ink-50) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)",
          200: "rgb(var(--ink-200) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
        },
        accent: {
          50: "rgb(var(--accent-50) / <alpha-value>)",
          100: "rgb(var(--accent-100) / <alpha-value>)",
          200: "rgb(var(--accent-200) / <alpha-value>)",
          300: "rgb(var(--accent-300) / <alpha-value>)",
          400: "rgb(var(--accent-400) / <alpha-value>)",
          500: "rgb(var(--accent-500) / <alpha-value>)",
          600: "rgb(var(--accent-600) / <alpha-value>)",
          700: "rgb(var(--accent-700) / <alpha-value>)",
        },
        danger: {
          400: "rgb(var(--danger-400) / <alpha-value>)",
          500: "rgb(var(--danger-500) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.4)",
        glow: "0 0 0 1px rgba(212,165,116,0.25), 0 8px 32px -8px rgba(212,165,116,0.15)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.95)" },
          "50%": { opacity: "0.75", transform: "scale(1.08)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        driftSlow: {
          "0%, 100%": { transform: "translate(0,0) rotate(0deg)" },
          "50%": { transform: "translate(4px, -4px) rotate(1.5deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 300ms ease-out",
        fadeInUp: "fadeInUp 420ms ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        pulseGlow: "pulseGlow 3.2s ease-in-out infinite",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        breathe: "breathe 3s ease-in-out infinite",
        driftSlow: "driftSlow 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
