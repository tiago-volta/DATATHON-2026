/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puente: {
          50: '#eef7f9',
          100: '#d5eef3',
          200: '#aedce8',
          300: '#78c3d4',
          400: '#3fa3bc',
          500: '#268399',
          600: '#1c6a7f',
          700: '#1a5566',
          800: '#164652',
          900: '#153b45',
          950: '#0c252e',
        },
        calma: {
          cream: '#f4f9fa',
          sand: '#e8f2f4',
          sage: '#dfece8',
          mist: '#eef5f7',
        },
        accent: {
          warm: '#c4896a',
          success: '#5ea37a',
          alert: '#c49a5c',
          info: '#6a9eb8',
        }
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'lectura': ['1.25rem', { lineHeight: '1.8' }],
        'lectura-lg': ['1.5rem', { lineHeight: '1.9' }],
        'lectura-xl': ['1.75rem', { lineHeight: '2' }],
      },
      spacing: {
        'lectura': '1.5rem',
      },
      borderRadius: {
        'suave': '1rem',
        'tarjeta': '1.5rem',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-soft': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-soft': 'fade-soft 0.7s ease-out both',
      },
    },
  },
  plugins: [],
}
