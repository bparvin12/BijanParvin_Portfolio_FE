/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        viridianGreen: '#029791',
        yankeesBlue: '#17273D',
        policeBlue: '#3D5872',
        tan: 'rgb(183,173,161)',
        brand: {
          DEFAULT: '#029791',
          400: '#03b5ae',
          500: '#029791',
          600: '#027a75',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
