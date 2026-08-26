/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcf4',
          100: '#d6f7e4',
          200: '#b0eece',
          300: '#79dfb1',
          400: '#3ec78e',
          500: '#10b981', // Emerald primary
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          50: '#f4f6fb',
          100: '#e7ecf6',
          200: '#d3def0',
          300: '#b2c7e5',
          400: '#8baad7',
          500: '#648dc8',
          600: '#4b70b5',
          700: '#3e5b97',
          800: '#364c7d',
          900: '#0f172a', // Deep slate / navy
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slight': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};
