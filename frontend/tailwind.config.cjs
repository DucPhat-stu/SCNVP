/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'hsl(210, 100%, 95%)',
          100: 'hsl(210, 100%, 90%)',
          200: 'hsl(210, 100%, 80%)',
          300: 'hsl(210, 95%, 70%)',
          400: 'hsl(210, 90%, 60%)',
          500: 'hsl(210, 90%, 55%)',
          600: 'hsl(210, 85%, 45%)',
          700: 'hsl(210, 80%, 35%)',
          800: 'hsl(210, 75%, 25%)',
          900: 'hsl(210, 70%, 15%)',
        },
        accent: {
          400: 'hsl(340, 80%, 60%)',
          500: 'hsl(340, 75%, 50%)',
          600: 'hsl(340, 70%, 40%)',
        },
        surface: {
          DEFAULT: 'hsl(220, 20%, 10%)',
          50:  'hsl(220, 15%, 95%)',
          100: 'hsl(220, 15%, 90%)',
          700: 'hsl(220, 20%, 18%)',
          800: 'hsl(220, 20%, 13%)',
          900: 'hsl(220, 20%, 8%)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
