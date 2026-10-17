/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9f0',
          100: '#fdf0d9',
          200: '#fbe1b3',
          300: '#f9d28d',
          400: '#f7c367',
          500: '#DEAD6F', // Main primary/accent gold
          600: '#c2995c',
          700: '#a67d49',
          800: '#8a6136',
          900: '#6e4523',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#727272',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#111111',
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
