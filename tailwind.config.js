/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === "widget";
module.exports = {
  important: isWidgetOnly ? '#jupiter-embed' : false,
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
      },
      backgroundImage: {
        'jupiter-gradient': 'linear-gradient(91.26deg, #FCC00A 15.73%, #4EBAE9 83.27%)',
      }
    },
  },
}
