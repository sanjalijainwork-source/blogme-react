/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"DM Serif Display"', "Georgia", "serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: [
          '"Source Sans 3"',
          "-apple-system",
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
      colors: {
        bg: "#fafaf7",
        text: "#1a1a1a",
        "text-secondary": "#57534e",
        "text-muted": "#a8a29e",
        border: "#d6d3d1",
        "border-light": "#e7e5e4",
        accent: "#1a1a1a",
        "accent-hover": "#333",
        "card-bg": "#ffffff",
        /* Design panel: Stone palette 50–800 (matches CSS variables) */
        stone: {
          0: "var(--color-stone-0)",
          50: "var(--color-stone-50)",
          100: "var(--color-stone-100)",
          200: "var(--color-stone-200)",
          300: "var(--color-stone-300)",
          400: "var(--color-stone-400)",
          500: "var(--color-stone-500)",
          600: "var(--color-stone-600)",
          700: "var(--color-stone-700)",
          800: "var(--color-stone-800)",
        },
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
