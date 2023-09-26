/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '_includes/*.html',
    '_layouts/*.html'
  ],
  theme: {
    colors: {
      'aquamarine': {
        light: '#B8FEE7',
        DEFAULT: '#1CFCB2',
        dark: '#12C78B'
      },
      'grey': '#7e5bef',
      'offwhite': '#F8F8F6',
      'gray-dark': '#505A5F',
      'black': '#0B0C0C',
    },
    fontFamily: {
      sans: ['Atkinson Hyperlegible', 'sans-serif'],
      serif: ['EB Garamond', 'serif'],
    },
    fontSize: {
      sm: ['0.812rem', '1.25rem'],
      base: ['1rem', '1.625rem'],
      lg: ['1.25rem', '2rem'],
      xl: ['1.562rem', '2rem'],
      '2xl': ['1.938rem', '2.25rem'],
      '3xl': ['2.438rem', '2.75rem'],
      '4xl': ['3.062rem', '3.5rem'],
    },
    extend: {},
  },
  plugins: [],
}

