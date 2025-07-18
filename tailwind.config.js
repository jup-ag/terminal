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

        // Theming
        primary: 'rgba(var(--jupiter-terminal-primary, 199, 242, 132), <alpha-value>)',
        background: 'rgba(var(--jupiter-terminal-background,0, 0, 0), <alpha-value>)',
        'primary-text': 'rgba(var(--jupiter-terminal-primary-text,232, 249, 255),<alpha-value>)',
        warning: 'rgba(var(--jupiter-terminal-warning,251, 191, 36),<alpha-value>)',
        interactive: 'rgba(var(--jupiter-terminal-interactive,33, 42, 54),<alpha-value>)',
        module: 'rgba(var(--jupiter-terminal-module,16, 23, 31),<alpha-value>)',

        'v3-bg': 'rgba(28, 41, 54, 1)',

        // #region V3 palette
        'utility-warning-300': '#B54708',

        'success':'#23C1AA',

        'uiv2-text': '#07090F',
        'landing-bg': '#0b0e13',
        'landing-gradient-start': '#0f111a',
        'landing-gradient-end': '#181b27',
        'landing-primary': '#C7F284',
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
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
      },
      animation: {
        shine: 'shine 3.5s linear infinite',
        hue: 'hue 10s infinite linear',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
