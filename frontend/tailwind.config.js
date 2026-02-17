/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      spacing: {
        '70': '17.5rem', // 280px
        '18': '4.5rem',  // 72px
      },
      width: {
        '70': '17.5rem',
      },
      margin: {
        '70': '17.5rem',
      },
      // Breakpoints personnalisés (optionnel)
      screens: {
        'xs': '475px',
        // sm: '640px' (défaut)
        // md: '768px' (défaut)
        // lg: '1024px' (défaut)
        // xl: '1280px' (défaut)
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
}