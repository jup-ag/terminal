/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === 'widget';
module.exports = {
  important: isWidgetOnly ? '#jupiter-terminal-instance' : false,
  corePlugins: {
    preflight: isWidgetOnly ? false : true,
  },
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        info: '#5762F1',

        'jupiter-input-light': '#EBEFF1',
        'jupiter-jungle-green': '#24AE8F',
        'jupiter-primary': '#FBA43A',
        warning: '#FAA63C',

        // v2 colors
        'v2-primary': 'rgba(199, 242, 132, 1)',
        'v2-background': '#304256',
        'v2-background-dark': '#19232D',
        'v2-lily': '#E8F9FF',
        'v2-background-page': '#1C2936',
        'v2-header-background': '#192531',
        'v2-perps-modal': '#1B2229',
        'v2-perps-input': '#13181D',

        'v3-bg': 'rgba(28, 41, 54, 1)',
        'v3-primary': '#c7f284',
        'v3-modal': '#222B33',

        // #region V3 palette
        'utility-error-50': '#55160C',
        'utility-error-200': '#912018',
        'utility-error-700': '#FDA29B',
        'text-warning-primary': '#FDB022',
        'utility-warning-50': '#4E1D09',
        'utility-warning-300': '#B54708',
        'utility-warning-600': '#FDB022',

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
