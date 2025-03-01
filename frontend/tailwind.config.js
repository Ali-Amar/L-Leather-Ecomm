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
          DEFAULT: '#0A3624',
          light: '#144936',
          dark: '#062718',
        },
        secondary: {
          DEFAULT: '#ffffff',
          dark: '#f3f3f3',
        },
        accent: {
          DEFAULT: '#D4B998',  // A warm beige/brown for leather aesthetic
          light: '#E5D2B8',
          dark: '#C3A887',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
}