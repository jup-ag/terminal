/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#jupiter-embed',
  corePlugins: {
    preflight: false,
    container: false,
  },
  mode: 'jit',
  darkMode: 'class',
  // prefix: 'jup-',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
