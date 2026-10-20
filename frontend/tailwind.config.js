/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puente: {
          50: '#f0f7f9',
          100: '#d9eef3',
          200: '#b3dce7',
          300: '#7cc3d6',
          400: '#3fa3bc',
          500: '#2a8299',
          600: '#1e6a7f',
          700: '#1a5566',
          800: '#1a4652',
          900: '#1a3b46',
          950: '#0d252e',
        },
        calma: {
          cream: '#fdfbf7',
          sand: '#f5f0e8',
          sage: '#e8ede9',
          mist: '#f0f4f5',
        },
        accent: {
          warm: '#e8a87c',
          success: '#7eb88c',
          alert: '#d4a373',
          info: '#8cb4c9',
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
      }
    },
  },
  plugins: [],
}
