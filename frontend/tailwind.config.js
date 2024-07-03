/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        light_mode_1: "#F6F6F7",
        dark_mode_1: "#161618",
        light_mode_2: "#FFF",
        dark_mode_2: "#1B1B1F",
        light_mode_title_text: "#3C3C43",
        light_mode_content_text: "#6E6E73",
        dark_mode_content_text: "#DFDFD6",
        light_mode_text_hover: "#3451B2",
      },
    },
  },
  plugins: [],
};
