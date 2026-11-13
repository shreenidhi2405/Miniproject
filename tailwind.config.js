/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070b14",
          card: "#0f172a",
          cardBorder: "#1e293b",
          cardHover: "#17233f",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          darkNavy: "#0a0f1d",
          muted: "#94a3b8",
        }
      }
    },
  },
  plugins: [],
}

