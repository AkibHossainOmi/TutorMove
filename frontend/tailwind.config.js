// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Semantic color system
        primary: colors.indigo,   // Professional, trustworthy
        secondary: colors.fuchsia, // Creative, vibrant
        accent: colors.cyan,       // Modern, tech
        success: colors.emerald,
        warning: colors.amber,
        error: colors.rose,
        info: colors.sky,

        // Neutral scales for dark mode backgrounds (Zinc is professional and modern)
        dark: {
          bg: '#09090b',         // zinc-950
          'bg-secondary': '#18181b', // zinc-900
          'bg-tertiary': '#27272a',  // zinc-800
          card: '#18181b',       // zinc-900
          border: '#27272a',     // zinc-800
          'border-hover': '#3f3f46', // zinc-700
          text: {
            primary: '#fafafa',   // zinc-50
            secondary: '#a1a1aa', // zinc-400
            muted: '#52525b',     // zinc-600
          }
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(79, 70, 229, 0.15)',
        'glow-secondary': '0 0 20px rgba(192, 38, 211, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
