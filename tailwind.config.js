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
      colors: {
        // Primary Colors
        'warm-honey': {
          DEFAULT: '#E8A445', // Warm Wood Honey - Primary CTAs, hover states, price highlights
        },
        'deep-charcoal': {
          DEFAULT: '#2C2C2C', // Deep Charcoal - Body text, headings, navigation
          darker: '#1A1A1A',  // 10% darker for footer background, hero overlay text
        },
        'soft-cream': {
          DEFAULT: '#F5EFE0', // Soft Cream - Main background, card backgrounds
          lighter: '#FAF7F0', // 50% lighter - Page background alternative
        },
        // Secondary Colors
        'sage-green': {
          DEFAULT: '#7A9B6E', // Fresh Sage Green - Secondary CTAs, success messages
        },
        'sky-blue': {
          DEFAULT: '#B8CDE8', // Warm Sky Blue - Text links, info messages, progress indicators
        },
        'terracotta': {
          DEFAULT: '#C67B5C', // Rich Terracotta - Urgency messaging, sale badges, alerts
        },
        // Neutral Colors
        'charcoal-light': '#E8E8E8', // Charcoal 90% lighter - Borders, dividers
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        ghibli: {
          "primary": "#E8A445",           // Warm Wood Honey
          "secondary": "#7A9B6E",         // Fresh Sage Green
          "accent": "#C67B5C",            // Rich Terracotta
          "neutral": "#2C2C2C",           // Deep Charcoal
          "base-100": "#F5EFE0",          // Soft Cream
          "base-200": "#FAF7F0",          // Soft Cream lighter
          "base-300": "#E8E8E8",          // Charcoal light (borders)
          "info": "#B8CDE8",              // Warm Sky Blue
          "success": "#7A9B6E",           // Fresh Sage Green
          "warning": "#E8A445",           // Warm Wood Honey
          "error": "#C67B5C",             // Rich Terracotta
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
