/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        // Design token — Plan Task B2B
        bg: {
          DEFAULT: "#ffffff",
          surface: "#ffffff",
          surface2: "#f4f4f8",
        },
        brand: {
          DEFAULT: "#7c6fcd",
          dark: "#534ab7",
        },
        border: {
          DEFAULT: "#e4e4ec",
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
