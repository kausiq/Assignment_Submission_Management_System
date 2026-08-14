/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2A4A',
          50: '#EEF1F7',
          100: '#D7DDEB',
          200: '#AFBBD7',
          300: '#8799C3',
          400: '#5F77AF',
          500: '#3D5590',
          600: '#2A3E6E',
          700: '#1B2A4A',
          800: '#131F38',
          900: '#0C1526'
        },
        paper: '#FAFAF7',
        teal: {
          DEFAULT: '#2F6F6F',
          50: '#EAF3F3',
          100: '#CBE1E1',
          500: '#2F6F6F',
          600: '#255959',
          700: '#1C4444'
        },
        gold: {
          DEFAULT: '#C9922A',
          100: '#F3E2C0',
          500: '#C9922A',
          600: '#A97719'
        },
        rose: {
          DEFAULT: '#B5484D',
          100: '#F1D3D4',
          500: '#B5484D',
          600: '#953639'
        },
        slate: {
          DEFAULT: '#5B6472'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '10px'
      }
    }
  },
  plugins: []
};
