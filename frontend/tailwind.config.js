/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#fff0f5",
          100: "#ffe4e1",
          200: "#ffb6c1",
          300: "#ff69b4",
          400: "#ff1493",
          500: "#db7093",
          600: "#c71585",
          700: "#d8bfd8",
          800: "#dda0dd",
          900: "#da70d6",
        },
        surface: {
          900: "#fff0f5", // Lightest pastel background
          800: "#ffffff", // Pure white for cards/surfaces
          700: "#fff5f8", // Very faint pink for hovers
          600: "#ffe4e1", // Subtle pink border
        },
      },
    },
  },
  plugins: [],
};
