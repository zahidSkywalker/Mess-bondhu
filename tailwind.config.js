/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        baltic: {
          blue: '#22577a',
        },
        tropical: {
          teal: '#38a3a5',
        },
        emerald: {
          DEFAULT: '#57cc99',
        },
        light: {
          green: '#80ed99',
        },
        tea: {
          green: '#c7f9cc',
        }
      },
      fontFamily: {
        sans: ['"Bpmf Iansui"', 'Quicksand', 'sans-serif'], // Fallback to Quicksand via Google Fonts
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(86, 204, 153, 0.3)',
      }
    },
  },
  plugins: [],
}
