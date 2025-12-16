// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // Enhanced dark mode color palette
        dark: {
          // Background layers - deep, rich blacks with subtle purple tint
          bg: '#0a0a0f',
          'bg-secondary': '#11111a',
          'bg-tertiary': '#18182b',

          // Card backgrounds - slightly elevated with better contrast
          card: '#151521',
          'card-hover': '#1a1a2e',
          'card-elevated': '#1e1e33',

          // Borders - subtle with purple undertones
          border: '#252538',
          'border-hover': '#2d2d47',
          'border-bright': '#3a3a5a',

          // Text colors
          text: {
            primary: '#e8e8f0',
            secondary: '#a0a0b8',
            muted: '#6b6b85',
          },
        },
      },
      boxShadow: {
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.6)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.8)',
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
        'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.2)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.15)',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(180deg, #0a0a0f 0%, #11111a 100%)',
        'dark-gradient-radial': 'radial-gradient(circle at top, #1a1a2e 0%, #0a0a0f 100%)',
      },
    },
  },
  plugins: [],
};