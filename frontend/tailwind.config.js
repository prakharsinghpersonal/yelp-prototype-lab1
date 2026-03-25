/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yelp: {
          primary: '#e1515f',    // Yelp red
          dark: '#333333',       // Dark text
          light: '#f5f5f5',      // Soft backgrounds
          border: '#e1e1e1',     // Subtle borders
          hover: '#c41200',      // Hover states
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 6px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 16px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },
    },
  },
  plugins: [],
}
