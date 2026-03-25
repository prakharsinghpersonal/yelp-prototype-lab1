/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy:   '#003049',  // dark backgrounds, navbar
          red:    '#d62828',  // primary actions, stars
          orange: '#f77f00',  // accents, badges
          yellow: '#fcbf49',  // highlights
          cream:  '#eae2b7',  // soft backgrounds
        },
        // keep short aliases used in JSX
        'yelp-red':    '#d62828',
        'brand-dark':  '#003049',
        'brand-teal':  '#f77f00',  // mapped to orange — used as accent throughout
      },
    },
  },
  plugins: [],
}
