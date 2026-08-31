/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A1A2E',
          dark: '#0F0F23',
          light: '#16213E',
          card: '#1F2440',
          border: '#2E3856'
        },
        mc: {
          red: '#EB001B',
          amber: '#F79E1B',
          orange: '#FF5F00'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(235, 0, 27, 0.4), 0 0 10px rgba(247, 158, 27, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(235, 0, 27, 0.8), 0 0 30px rgba(247, 158, 27, 0.5)' }
        }
      }
    },
  },
  plugins: [],
}
