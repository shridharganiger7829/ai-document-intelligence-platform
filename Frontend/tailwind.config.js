/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f26a36', // signature warm sunset terracotta
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#f26a36',
          hover: '#df5824',
        },
        navy: {
          950: '#060f13',
          900: '#0a191f', // Sight banking dark teal
          850: '#0e222b',
          800: '#142d38',
          700: '#1a3a47',
          600: '#234e5f',
          500: '#31697f',
        },
        surface: {
          dark: '#0e222b',
          card: '#122933',
          cardHover: '#16333f',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(242, 106, 54, 0.35)',
        'glow-teal': '0 0 25px -5px rgba(49, 105, 127, 0.4)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.07)',
      },
      backgroundImage: {
        'radial-gradient-teal': 'radial-gradient(circle at 80% 20%, #1e4b58 0%, #0a191f 65%, #060f13 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'orange-gradient': 'linear-gradient(135deg, #f26a36 0%, #d94e18 100%)',
      }
    },
  },
  plugins: [],
}
