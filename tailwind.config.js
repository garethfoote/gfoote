
const orangeflame = {
  "3": '#FC5F1C',
  "4": '#DA490B',
  DEFAULT: '#B83700',
  "6": '#962D00',
  "7": '#742300'
}
const blue = {
  "3": '#122CAE',
  "4": '#122CAE',
  DEFAULT: '#122CAE',
  "6": '#122CAE',
  "7": '#122CAE'
}
const aquamarine = {
  "3": '#B8FEE7',
  "4": '#1CFCB2',
  DEFAULT: '#12C78B',
  "6": '#0CAD78',
  "7": '#05855B'
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '_includes/*.html',
    '_layouts/*.html'
  ],
  theme: {
    colors: {
      'accent': blue,
      'yellow': {
        light: "#fef08a",
        DEFAULT: '#fef08a',
      },
      'offwhite': '#F8F5DA',
      'black': '#2E2C2C',
      'grey':  {
        "1": '#CBCFD1',
        "2": '#BCC0C2',
        "3": '#8E9498', //lightest
        "4": '#6C787F', //light
        DEFAULT: '#505A5F',
        "6": '#303639',
      },
    },
    fontFamily: {
      sans: ['Atkinson Hyperlegible', 'sans-serif'],
      serif: ['EB Garamond', 'serif'],
    },
    fontSize: {
      xs: ['0.6875rem', '1.25rem'], // 13px
      sm: ['0.875rem', '1.25rem'], // 13px
      base: ['1rem', '1.5rem'], // 16px, 24px
      md: ['1.125rem', '1.75rem'], // 18px, 28px
      lg: ['1.25rem', '2rem'], // 20px, 32px
      'lg-plus': ['1.375rem', '2rem'], // 22px, 32px
      xl: ['1.562rem', '2.44rem'], // 25px, 32px 
      '1.5xl': ['1.6875rem', '2.125rem'], // 27px, 34px 
      '2xl': ['1.938rem', '2.25rem'], // 31px, 36px
      '3xl': ['2.438rem', '2.75rem'], // 39px, 44px
      '4xl': ['3.062rem', '3.5rem'],
    },
    extend: {},
  },
  plugins: [],
}

