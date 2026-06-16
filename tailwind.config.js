/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        // Design token — Plan Task B2B
        bg: {
          DEFAULT: "#0f0f13",
          surface: "#16161d",
          surface2: "#1c1c26",
        },
        brand: {
          DEFAULT: "#7c6fcd",
          dark: "#534ab7",
        },
        border: {
          DEFAULT: "#2a2a38",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "SF Pro Display",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
