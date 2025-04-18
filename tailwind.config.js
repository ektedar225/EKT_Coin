/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './blockchain/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'binance': {
          gold: '#F0B90B',
          'gold-light': '#F8D33A',
          dark: '#0C0C0C',
          'gray-dark': '#1E2026',
          'gray-medium': '#2B2F36',
          'gray-light': '#474D57'
        }
      }
    },
  },
  plugins: [],
};