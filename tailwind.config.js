/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#D42A30",
          redDark: "#8E0F1B",
          black: "#0B0B0C",
        },
      },
      boxShadow: {
        tile: "0 8px 24px rgba(0,0,0,.08)",
        tileHover: "0 16px 40px rgba(0,0,0,.12)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};


