/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === "widget";
module.exports = {
  important: isWidgetOnly ? '#jupiter-easy-modal' : false,
  corePlugins: isWidgetOnly ? {
    preflight: false,
    container: false,
  } : {},
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'jupiter-input-light': '#EBEFF1',
        'jupiter-bg': '#3A3B43',
      },
      backgroundImage: {
        'jupiter-gradient': 'linear-gradient(91.26deg, #FCC00A 15.73%, #4EBAE9 83.27%)',
        'jupiter-swap-gradient': 'linear-gradient(96.8deg, rgba(250, 164, 58, 1) 4.71%, rgba(113, 229, 237, 1) 87.84%)',
      }
    },
  },
}
