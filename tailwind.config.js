/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1e3a5f",
          2: "#2a4a73",
          3: "#34568a",
        },
        gold: {
          DEFAULT: "#c8a559",
          soft: "#f3ead7",
        },
        ink: {
          DEFAULT: "#0f172a",
          2: "#475569",
        },
        line: "#e2e8f0",
        bg: "#f7f8fa",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
