/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // DICS domain palette
        gold: {
          DEFAULT: '#D4AF37',
          400: '#D4AF37',
        },
        'dics-green': '#2E7D32',
        'dics-blue': '#1565C0',
        'dics-orange': '#E65100',
        'dics-purple': '#6A1B9A',
        'dics-red': '#B71C1C',
        'dics-teal': '#00695C',
      },
    },
  },
  plugins: [],
};
