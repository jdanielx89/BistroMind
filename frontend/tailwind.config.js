/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f171e',
        cardBg: '#1b262f',
        accentBlue: '#00b4d8',
      }
    },
  },
  plugins: [],
}