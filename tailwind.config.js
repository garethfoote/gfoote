const orangeflame = {
  lightest: '#FD9C72',
  light: '#FC804A',
  DEFAULT: '#FC5F1C',
  dark: '#F14B04',
  darkest: '#C93E03'
}
const aquamarine = {
  lightest: '#DDFFF4',
  light: '#B8FEE7',
  DEFAULT: '#1CFCB2',
  dark: '#12C78B',
  darkest: '#0CAD78'
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '_includes/*.html',
    '_layouts/*.html'
  ],
  theme: {
    colors: {
      'accent': aquamarine,
      'yellow': '#FFFF00', // possibly unused
      'offwhite': '#FCFCFC',
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
      base: ['1rem', '1.625rem'], // 16px, 26px
      md: ['1.125rem', '1.75rem'], // 18px, 28px
      lg: ['1.25rem', '2rem'], // 20px, 32px
      xl: ['1.562rem', '2.44rem'], // 25px, 32px 
      '2xl': ['1.938rem', '2.25rem'], // 31px, 36px
      '3xl': ['2.438rem', '2.75rem'], // 39px, 44px
      '4xl': ['3.062rem', '3.5rem'],
    },
    extend: {},
  },
  plugins: [],
}

