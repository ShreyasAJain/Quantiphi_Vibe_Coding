/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        redPulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.8)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)',
            transform: 'scale(1.06)',
          },
        },
      },
      animation: {
        'red-pulse': 'redPulse 1.5s infinite',
      },
    },
  },
  plugins: [],
};
