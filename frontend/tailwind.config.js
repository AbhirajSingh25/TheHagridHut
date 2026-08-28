/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#ff0000",
        secondary: "#00ffff",
        background: "#050505",
        surface: "#0a0a0a",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 40px rgba(255,0,0,0.25)",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      animation: {
        pulseSlow: "pulse 4s infinite",
      },
    },
  },

  plugins: [],
};