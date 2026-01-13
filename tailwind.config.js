/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        ghibli: {
          "primary": "#7ba05b",           // Forest green (Totoro)
          "secondary": "#e8a87c",         // Warm peach/orange
          "accent": "#f4a5a5",            // Soft pink (Ponyo)
          "neutral": "#5c6b73",           // Slate gray
          "base-100": "#fdfaf3",          // Warm cream
          "base-200": "#f5eee6",          // Lighter cream
          "base-300": "#e8dfd2",          // Soft beige
          "info": "#89b4d4",              // Sky blue
          "success": "#88c057",           // Fresh green
          "warning": "#f5c26b",           // Golden yellow
          "error": "#e07a5f",             // Soft coral red
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
