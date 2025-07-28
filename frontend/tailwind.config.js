/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        do_blue: "#0272AD", // DigitalOcean Blue
        do_blue_light: "#0272AD",
        do_bg_light: "#f7fafc",
        do_bg_dark: "#17181C",
        do_card_light: "#fff",
        do_card_dark: "#23262F",
        do_border_light: "#e5e7eb",
        do_border_dark: "#23262F",
        do_text_light: "#111827",
        do_text_dark: "#fff",
        do_text_secondary_light: "#0069ff",
        do_text_secondary_dark: "#B3C7FF",
        do_text_gray_light: "#6b7280",
        do_text_gray_dark: "#B3C7FF",
      },
    },
  },
};
