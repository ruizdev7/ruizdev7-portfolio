/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg_dark_mode: "#17181C",
        bg_light_mode: "#F7FAFC",
        bg_card_dark_mode: "#23262F",
      },
    },
  },
};
