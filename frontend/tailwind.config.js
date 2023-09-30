/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: "#4584b6",
        secondary: {
          100: "#FFFFFF",
          900: "#F9F9F9", 
        },
      }
    },
  },
  plugins: [],
}

