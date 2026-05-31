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
        // v0.3 tokens
        'v03-green': {
          100: 'var(--v03-green-100)',
          200: 'var(--v03-green-200)',
          300: 'var(--v03-green-300)',
          400: 'var(--v03-green-400)',
          700: 'var(--v03-green-700)',
          900: 'var(--v03-green-900)',
        },
        'v03-turquoise': {
          300: 'var(--v03-turquoise-300)',
          950: 'var(--v03-turquoise-950)',
        },
        'v03-white': 'var(--v03-white)',
        'v03-bg-light': 'var(--v03-bg-light)',
        'v03-surface-dark': 'var(--v03-surface-dark)',
        'v03-text-on-dark': 'var(--v03-text-on-dark)',
        'v03-text-muted-on-dark': 'var(--v03-text-muted-on-dark)',
        'v03-accent': 'var(--v03-accent)',
        'v03-accent-foreground': 'var(--v03-accent-foreground)',
        'v03-text-on-light': 'var(--v03-text-on-light)',
        'v03-accent-purple': 'var(--v03-accent-purple)',

        // v0.2 legacy — keep until S4 restyle
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
        simpler: ['Simpler Pro', 'var(--font-simpler)', 'Assistant', 'sans-serif'],
        heebo: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
        montserrat: ['"Montserrat Alternates"', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        varela: ['"Varela Round"', 'sans-serif'],
      },
      fontSize: {
        'v03-eyebrow': ['var(--v03-text-eyebrow-size)', { lineHeight: 'var(--v03-text-eyebrow-leading)', letterSpacing: 'var(--v03-text-eyebrow-tracking)' }],
        'v03-display': ['var(--v03-text-display-size)', { lineHeight: 'var(--v03-text-display-leading)', letterSpacing: 'var(--v03-text-display-tracking)' }],
        'v03-lead': ['var(--v03-text-lead-size)', { lineHeight: 'var(--v03-text-lead-leading)', letterSpacing: 'var(--v03-text-lead-tracking)' }],
        'v03-body': ['var(--v03-text-body-size)', { lineHeight: 'var(--v03-text-body-leading)' }],
        'v03-button': ['var(--v03-text-button-size)', { lineHeight: '1' }],
      },
      width: {
        'v03-screen': 'var(--v03-screen-width)',
        'v03-content': 'var(--v03-content-width)',
      },
      height: {
        'v03-screen': 'var(--v03-screen-height)',
      },
      maxWidth: {
        'v03-content': 'var(--v03-content-width)',
      },
      spacing: {
        'v03-gutter': 'var(--v03-gutter)',
      },
      borderRadius: {
        'v03-button': 'var(--v03-radius-button)',
      },
      boxShadow: {
        card: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        'v03-button': 'var(--v03-shadow-button)',
        'v03-display': 'var(--v03-shadow-display)',
      },
    },
  },
  plugins: [],
};
