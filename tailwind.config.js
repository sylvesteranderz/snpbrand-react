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
          50: '#f0f4f7',
          100: '#d9e4ed',
          200: '#b3c9db',
          300: '#8daec9',
          400: '#6995b1',
          500: '#6995b1', // Main primary color
          600: '#5a7a96',
          700: '#4b5f7b',
          800: '#3c4460',
          900: '#2d2945',
        },
        accent: {
          50: '#fef9f0',
          100: '#fdf0d9',
          200: '#fbe1b3',
          300: '#f9d28d',
          400: '#f7c367',
          500: '#DEAD6F', // Main accent color
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
          900: '#222222',
        }
      },
      fontFamily: {
        'chilanka': ['Chilanka', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'medium': '0 8px 25px 0 rgba(0, 0, 0, 0.1)',
        'strong': '0 15px 35px 0 rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
