/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // brand palette — single source of truth
        cream: {
          50:  "#fdfaf5",
          100: "#F5F0E8",
          200: "#ede4d3",
          300: "#ddd0b8",
        },
        forest: {
          50:  "#eef4f3",
          100: "#d0e4e2",
          200: "#9ec9c5",
          400: "#4d9a94",
          600: "#2d6b66",
          700: "#1a4a47",   // primary brand
          800: "#133835",
          900: "#0c2422",
        },
        gold: {
          300: "#fad96a",
          400: "#F5C842",   // CTA accent
          500: "#e6b730",
          600: "#c99d1a",
        },
        ink: {
          50:  "#f7f7f6",
          100: "#ededeb",
          300: "#c4c2be",
          500: "#8a8782",
          700: "#4a4845",
          900: "#1a1917",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans:    ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        "card":    "0 2px 8px rgba(26,73,71,0.06), 0 12px 40px rgba(26,73,71,0.08)",
        "card-lg": "0 4px 16px rgba(26,73,71,0.08), 0 24px 64px rgba(26,73,71,0.12)",
        "btn":     "0 2px 8px rgba(245,200,66,0.35)",
        "btn-hover":"0 4px 16px rgba(245,200,66,0.50)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};