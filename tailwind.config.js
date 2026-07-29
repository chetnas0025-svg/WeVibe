/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#D4AF37',
          dark: '#AA7C11',
          rose: '#E5C158',
        },
        espresso: {
          50: '#FDFBF7',
          100: '#F7F2E9',
          800: '#2C221E',
          900: '#1A1412',
        },
        cream: {
          50: '#FAFAF7',
          100: '#F5F5F0',
          200: '#EBEAE0',
        },
        navy: {
          900: '#0F172A',
          950: '#090D16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
