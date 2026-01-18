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
          "primary": "#D4843E",           // Warm amber/golden (desk surface)
          "secondary": "#8B6F47",         // Rich brown (wood tones)
          "accent": "#6B8E4E",            // Soft green (plants)
          "neutral": "#5C4A3A",           // Warm dark brown
          "base-100": "#F5E6D3",          // Warm cream (walls)
          "base-200": "#EDD9C3",          // Light tan
          "base-300": "#D9C4A8",          // Soft beige
          "info": "#7BA8C7",              // Sky blue (window)
          "success": "#88A855",           // Fresh green
          "warning": "#E5A54B",           // Golden amber
          "error": "#C97854",             // Warm terracotta
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
