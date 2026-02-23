/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange': {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        'amber': {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        'gray': {
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        }
      }
    },
  },
  plugins: [],
}
