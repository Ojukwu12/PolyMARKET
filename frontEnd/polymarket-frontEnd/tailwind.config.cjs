/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          400: '#06b6d4',
          600: '#0891b2'
        }
      },
      boxShadow: {
        card: '0 6px 18px rgba(2,6,23,0.45)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
