/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12181F",
          900: "#1A2333",
          800: "#242F42",
          700: "#334158",
          500: "#5D6B82",
          300: "#9AA6B8",
          100: "#DDE2E9",
        },
        paper: {
          DEFAULT: "#EDF1F5",
          raised: "#F7F9FB",
        },
        signal: {
          allow: "#1F9D6E",
          allowSoft: "#E4F5EE",
          disallow: "#D34C3E",
          disallowSoft: "#FBEAE8",
          neutral: "#5B5FE0",
          neutralSoft: "#ECEDFB",
          accent: "#0DA7A0",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(18, 24, 31, 0.06), 0 8px 24px -12px rgba(18, 24, 31, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
