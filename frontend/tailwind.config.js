/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#86868b',
          400: '#6e6e73',
          500: '#424245',
          600: '#1d1d1f',
          700: '#3a3a3c',
          800: '#1d1d1f',
          900: '#1d1d1f',
          950: '#000000',
        },
        calma: {
          cream: '#ffffff',
          sand: '#ffffff',
          sage: '#eef4f2',
          mist: '#f0f5f8',
        },
        accent: {
          warm: '#9a5340',
          success: '#1e6b45',
          alert: '#8a4b12',
          info: '#0369a1',
          navy: '#0c4a6e',
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
        'suave': '0.75rem',
        'tarjeta': '1.25rem',
      },
    },
  },
  plugins: [],
}
