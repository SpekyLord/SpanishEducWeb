/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fb: {
          bg: '#18191a',
          card: '#242526',
          hover: '#3a3b3c',
          border: '#3a3b3c',
          input: '#3a3b3c',
        }
      },
      boxShadow: {
        'fb': '0 1px 2px rgba(0, 0, 0, 0.2)',
        'fb-lg': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'fb-xl': '0 4px 8px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
