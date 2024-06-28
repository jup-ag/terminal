/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === "widget";
module.exports = {
  important: isWidgetOnly ? '#jupiter-terminal' : false,
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'jupiter-input-light': '#EBEFF1',
        'jupiter-jungle-green': '#24AE8F',
        'jupiter-primary': '#FBA43A',
        warning: '#FAA63C',
        
        'v3-bg': 'rgba(28, 41, 54, 1)',
        'v3-primary': '#c7f284',
        'v3-modal': '#222B33',
        'v2-lily': '#E8F9FF',
      },
      fontSize: {
        xxs: ['0.625rem', '1rem'],
      },
      backgroundImage: {
        'v3-text-gradient': 'linear-gradient(247.44deg, #C7F284 13.88%, #00BEF0 99.28%)',
      },
      keyframes: {
        shine: {
          '100%': {
            'background-position': '200% center',
          },
        },
        hue: {
          '0%': {
            '-webkit-filter': 'hue-rotate(0deg)',
          },
          '100%': {
            '-webkit-filter': 'hue-rotate(-360deg)',
          },
        },
      },
      animation: {
        shine: 'shine 3.5s linear infinite',
        hue: 'hue 10s infinite linear',
      }
    },
  },
  variants: {
    extend: {
      // Enable dark mode, hover, on backgroundImage utilities
      backgroundImage: ['dark', 'hover', 'focus-within', 'focus'],
    },
  },
}
