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
          bg: '#1a1a2e',
          card: '#16213e',
          'card-elevated': '#1a2744',
          hover: '#0f3460',
          border: 'rgba(255,255,255,0.08)',
          input: '#0f3460',
        },
        accent: '#e94560',
        'accent-light': '#f06680',
        gold: '#c9a96e',
        'gold-light': '#d4b87e',
        cream: '#faf3e8',
        light: '#f0e6d3',
      },
      boxShadow: {
        'fb': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'fb-lg': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'fb-xl': '0 8px 16px rgba(0, 0, 0, 0.5)',
        'glow-accent': '0 0 20px rgba(233, 69, 96, 0.15)',
        'glow-gold': '0 0 20px rgba(201, 169, 110, 0.15)',
        'glow-accent-md': '0 0 30px rgba(233, 69, 96, 0.25)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(233, 69, 96, 0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(233, 69, 96, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
