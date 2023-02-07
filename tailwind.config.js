/** @type {import('tailwindcss').Config} */

const isWidgetOnly = process.env.MODE === "widget";
module.exports = {
  important: isWidgetOnly ? '#jupiter-terminal' : false,
  // corePlugins: isWidgetOnly ? {
  //   preflight: false,
  //   container: false,
  // } : {},
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
        'jupiter-dark-bg': '#292A33',
        'jupiter-jungle-green': '#24AE8F',
        'jupiter-primary': '#FBA43A',
      },
      backgroundImage: {
        'jupiter-gradient': 'linear-gradient(91.26deg, #FCC00A 15.73%, #4EBAE9 83.27%)',
        'jupiter-swap-gradient': 'linear-gradient(96.8deg, rgba(250, 164, 58, 1) 4.71%, rgba(113, 229, 237, 1) 87.84%)',
        'v2-gradient': 'linear-gradient(96.8deg, rgba(250, 196, 58, 0.1) 4.71%, rgba(34, 218, 229, 0.1) 87.84%)',
      }
    },
  },
}
