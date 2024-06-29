/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green_header: "#3A6164",
        gray_content_bar: "#F1EFED",
        primary2: "#FFD43B",
      },
    },
  },
  plugins: [],
};
