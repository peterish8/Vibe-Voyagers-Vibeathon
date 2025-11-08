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
        purple: {
          50: "#F8F5FF",
          100: "#F0E8FF",
          200: "#E5DFF5",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        blue: {
          50: "#EFF6FF",
          500: "#3B82F6",
        },
        green: {
          50: "#F0FDF4",
          500: "#10B981",
        },
        amber: {
          50: "#FFFBEB",
          500: "#F59E0B",
        },
      },
      fontFamily: {
        serif: ["Crimson Pro", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float": "float 25s ease-in-out infinite",
        "float-slow": "float 35s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "breathing": "breathing 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(20px, -20px, 0) scale(1.02)" },
          "66%": { transform: "translate3d(-15px, 15px, 0) scale(0.98)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.5" },
        },
        "breathing": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
