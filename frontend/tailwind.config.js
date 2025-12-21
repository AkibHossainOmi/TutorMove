// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo-500
          600: '#4f46e5', // Indigo-600 (Main Brand)
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef', // Fuchsia-500
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        accent: colors.cyan,
        success: colors.emerald,
        warning: colors.amber,
        error: colors.rose,
        info: colors.sky,

        // Professional Dark Mode Palette (Zinc based - cooler, sharper)
        dark: {
          bg: '#09090b',          // zinc-950 (Main BG)
          'bg-secondary': '#121215', // Slightly lighter than main
          'bg-tertiary': '#18181b',   // zinc-900 (Card BG)

          card: '#18181b',        // zinc-900
          'card-hover': '#202023',

          border: '#27272a',      // zinc-800
          'border-hover': '#3f3f46', // zinc-700

          text: {
            primary: '#fafafa',   // zinc-50
            secondary: '#a1a1aa', // zinc-400
            muted: '#71717a',     // zinc-500
          }
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(79, 70, 229, 0.25)',
        'glow-secondary': '0 0 20px rgba(192, 38, 211, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'neu-pressed': 'inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff',
        'neu-flat': '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-dark-1': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'elevation-dark-2': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'elevation-dark-3': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
