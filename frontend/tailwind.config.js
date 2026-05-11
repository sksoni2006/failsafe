/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        700: '700',
        800: '800',
      },
      colors: {
        risk: {
          DEFAULT: '#f43f5e',
          soft: 'rgba(244,63,94,0.12)',
        },
        safe: {
          DEFAULT: '#10b981',
          soft: 'rgba(16,185,129,0.12)',
        },
      },
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
      },
      backgroundImage: {
        'gradient-risk': 'linear-gradient(135deg, #f43f5e, #fb7185)',
        'gradient-safe': 'linear-gradient(135deg, #10b981, #34d399)',
        'gradient-brand': 'linear-gradient(135deg, #3b82f6, #f43f5e)',
      },
    },
  },
  plugins: [],
};
