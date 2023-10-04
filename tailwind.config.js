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
      'purple': '#7e5bef', // possibly unused
      'offwhite': '#FCFCFC',
      'black': '#0B0C0C',
      'grey':  {
        light: '#C3C3C3',
        DEFAULT: '#505A5F',
        dark: '#505A5F'
      },
    },
    fontFamily: {
      sans: ['Atkinson Hyperlegible', 'sans-serif'],
      serif: ['EB Garamond', 'serif'],
    },
    fontSize: {
      sm: ['0.875rem', '1.25rem'],
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

