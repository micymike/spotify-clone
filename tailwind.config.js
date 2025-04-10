/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1DB954',
        'dark': '#121212',
        'light': '#282828',
        'lighter': '#B3B3B3',
        'white': '#FFFFFF',
      },
      spacing: {
        'sidebar': '240px',
        'player': '90px',
      }
    },
  },
  plugins: [],
}
