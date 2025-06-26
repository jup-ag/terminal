/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === 'widget';
module.exports = {
  corePlugins: {
    preflight: true,
  },
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warning: '#FAA63C',


        primary: '#c7f284',
        'background': '#19232D',
        
        // v2 colors
        'v2-lily': '#E8F9FF',

        'v3-bg': 'rgba(28, 41, 54, 1)',

        // #region V3 palette
        'utility-warning-300': '#B54708',

        'uiv2-text': '#07090F',
        'v3-input-background': '#10171F',
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
      },
      boxShadow: {
        'swap-input-dark': '0px 2px 16px rgba(199, 242, 132, 0.25)',
      },
    },
  },
  variants: {
    extend: {
      // Enable dark mode, hover, on backgroundImage utilities
      backgroundImage: ['dark', 'hover', 'focus-within', 'focus'],
    },
  },
};
