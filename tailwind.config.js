/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./sections/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f6f6f2",
        lime: {
          DEFAULT: "#c6ff00",
          soft: "#e9ff9c",
        },
        wine: {
          DEFAULT: "#7e1241",
          deep: "#5c0d30",
        },
        punch: "#ff006e",
        ink: {
          DEFAULT: "#2b2d42",
          soft: "#565873",
          faint: "#8d8fa6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        hard: "4px 4px 0 0 #2b2d42",
        "hard-sm": "3px 3px 0 0 #2b2d42",
        "hard-lg": "8px 8px 0 0 #2b2d42",
        "hard-punch": "4px 4px 0 0 #ff006e",
        "hard-lime": "6px 6px 0 0 #c6ff00",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        blink: "blink 1s step-end infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
