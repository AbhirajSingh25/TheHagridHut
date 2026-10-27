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
        // Harmonize legacy violet and cyan classes into the VANVAS palette
        violet: {
          50: "#F4F7F8",
          100: "#E4ECF0",
          200: "#C4D2D5",
          300: "#8FA3AD",
          400: "#667780",
          500: "#526C7A",
          600: "#3D525E",
          700: "#273D4B",
          800: "#1C2E38",
          900: "#141F26",
        },
        cyan: {
          50: "#F4F7F4",
          100: "#E4EBE4",
          200: "#C8D6C8",
          300: "#A8BEA7",
          400: "#8FA28B",
          500: "#758A71",
          600: "#5B6E57",
          700: "#41523E",
          800: "#314B40",
          900: "#21332C",
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