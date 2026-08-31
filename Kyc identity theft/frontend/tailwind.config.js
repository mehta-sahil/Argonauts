/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Argonauts design system
        argos: {
          bg: '#0A0B0D',
          surface: '#15171B',
          border: '#2A2D33',
          text: '#F5F6F7',
          muted: '#9A9EA6',
        },
        // Functional accents
        attack: '#E5484D',
        defense: '#22D3EE',
        // Legacy Mastercard colours (kept for /kyc app)
        mc: {
          red: '#EB001B',
          amber: '#F79E1B',
          orange: '#FF5F00',
        },
        navy: {
          DEFAULT: '#1A1A2E',
          dark: '#0F0F23',
          light: '#16213E',
          card: '#1F2440',
          border: '#2E3856',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-node': 'pulseNode 2.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'headline-in': 'headlineIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'headline-out': 'headlineOut 0.4s cubic-bezier(0.7,0,0.84,0) forwards',
        'travel': 'travel 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseNode: {
          '0%, 100%': { opacity: '1', r: '8' },
          '50%': { opacity: '0.6', r: '12' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        headlineIn: {
          from: { opacity: '0', transform: 'translateY(32px) skewY(2deg)' },
          to: { opacity: '1', transform: 'translateY(0) skewY(0)' },
        },
        headlineOut: {
          from: { opacity: '1', transform: 'translateY(0) skewY(0)' },
          to: { opacity: '0', transform: 'translateY(-32px) skewY(-2deg)' },
        },
        travel: {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(229,72,77,0.4), 0 0 10px rgba(229,72,77,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(229,72,77,0.8), 0 0 40px rgba(229,72,77,0.3)' },
        },
      },
    },
  },
  plugins: [],
}
