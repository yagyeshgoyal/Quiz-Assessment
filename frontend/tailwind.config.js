/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: '#0d0f14',
        surface: '#151820',
        card: '#1c2030',
        border: '#2a2f3f',
        accent: '#e8b14f',
        accent2: '#4f9ee8',
        accent3: '#7e4fe8',
        muted: '#7a8199',
        success: '#4fcea0',
        danger: '#e84f6b',
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease',
        fadeIn: 'fadeIn 0.2s ease',
        slideUp: 'slideUp 0.25s ease',
        slideInRight: 'slideInRight 0.3s ease',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}