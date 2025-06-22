// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- This line is crucial!
  ],
  theme: {
    extend: {
      fontFamily: { // Make sure 'inter' is configured if you're using it
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};