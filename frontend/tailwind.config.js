/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: '#f0f7f5',
          100: '#e1eeea',
          200: '#c8ded7',
          300: '#7e9992',
          400: '#55736b',
          500: '#334e47',
          600: '#1e3b34',
          700: '#1b332d',
          800: '#132a24',
          900: '#0d1f1a',
          950: '#06120f',
        },
        calma: {
          cream: '#f9fcfb',
          sand: '#f3f9f7',
          sage: '#def3ed',
          mist: '#eaf6f2',
        },
        accent: {
          warm: '#9a5340',
          success: '#0f766e',
          alert: '#b45309',
          info: '#0f766e',
          navy: '#134e4a',
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
