/** @type {import('tailwindcss').Config} */

const isProduction = process.env.NODE_ENV === "production";
module.exports = {
  important: isProduction ? '#jupiter-embed' : false,
  corePlugins: isProduction ? {
    preflight: false,
    container: false,
  } : {},
  mode: 'jit',
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
}
