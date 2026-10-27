/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        linen: "#F3EADD",
        parchment: "#E5D6BE",
        cream: "#FAF5EC",
        walnut: "#49372B",
        ink: "#302820",
        moss: "#7A8065",
        sage: "#ADB09A",
        terracotta: "#AC7256",
        brass: "#B39460",
        rainy: "#333833",
        charcoal: "#282925",
        primary: {
          DEFAULT: "#49372B",
          hover: "#372A21",
        },
      },

      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Source Sans 3", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        hand: ["Caveat", "cursive", "sans-serif"],
      },

      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
    },
  },

  plugins: [],
};