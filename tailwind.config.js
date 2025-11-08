/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#F6F6F6',
        'secondary-bg': '#E6F19A',
        'card-bg': '#FFFCF8',
        'accent-green': '#E6F19A',
        'accent-blue': '#273143',
        'text-primary': '#262135',
        'text-secondary': '#494358',
        'text-muted': '#948DA9',
        'dark-blue': '#273143',
        'success': '#28a745',
        'warning': '#ffc107',
        'danger': '#dc3545',
      },
      fontFamily: {
        'montserrat': ['"Montserrat Alternates"', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
        'varela': ['"Varela Round"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0px 4px 4px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}