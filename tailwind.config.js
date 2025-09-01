/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#59a0ff", // sky blue accent
          dark: "#194D6E",    // deep navy accent
        },
      },
    },
  },
  plugins: [],
};