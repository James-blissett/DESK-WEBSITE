/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ghibli: {
          sky: '#A8D8EA',
          grass: '#8FBC8F',
          cream: '#FFF8E7',
          sunset: '#FFB6A3',
          forest: '#4A6741',
          cloud: '#E8F5E8',
          twilight: '#B8A9C9',
          earth: '#D4A574',
        },
      },
      fontFamily: {
        ghibli: ['Georgia', 'serif'],
      },
      boxShadow: {
        ghibli: '0 8px 32px rgba(74, 103, 65, 0.15)',
        'ghibli-lg': '0 12px 48px rgba(74, 103, 65, 0.2)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        ghibli: {
          'primary': '#8FBC8F',
          'secondary': '#A8D8EA',
          'accent': '#FFB6A3',
          'neutral': '#4A6741',
          'base-100': '#FFF8E7',
          'base-200': '#E8F5E8',
          'base-300': '#D4E8D4',
          'info': '#A8D8EA',
          'success': '#8FBC8F',
          'warning': '#FFB6A3',
          'error': '#D98B76',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
