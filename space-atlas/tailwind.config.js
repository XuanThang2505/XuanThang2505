/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { nunito: ['Nunito', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
