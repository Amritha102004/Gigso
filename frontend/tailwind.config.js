/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A6A2F',
        secondary: '#848462',
        textMain: '#171711',
        background: '#FAF9F6',
      }
    },
  },
  plugins: [],
}
