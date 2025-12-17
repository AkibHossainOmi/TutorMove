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
        // Professional Dark Mode Palette (Slate/Zinc based)
        dark: {
          // Background layers - Neutral, deep slate
          bg: '#020617',         // slate-950
          'bg-secondary': '#0f172a', // slate-900
          'bg-tertiary': '#1e293b',  // slate-800

          // Card backgrounds
          card: '#0f172a',       // slate-900
          'card-hover': '#1e293b',   // slate-800
          'card-elevated': '#1e293b', // slate-800

          // Borders - Crisp and subtle
          border: '#1e293b',     // slate-800
          'border-hover': '#334155', // slate-700
          'border-bright': '#475569', // slate-600

          // Text colors - High contrast
          text: {
            primary: '#f8fafc',   // slate-50
            secondary: '#cbd5e1', // slate-300
            muted: '#94a3b8',     // slate-400
          },
        },
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.05)',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
        'dark-gradient-radial': 'radial-gradient(circle at top, #1e293b 0%, #020617 100%)',
      },
    },
  },
  plugins: [],
};
