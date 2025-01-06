/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      xs: ["12px", "16px"],
      sm: ["14px", "20px"],
      base: ["16px", "19.5px"],
      lg: ["18px", "21.94px"],
      xl: ["20px", "24.38px"],
      "2xl": ["24px", "29.26px"],
      "3xl": ["28px", "50px"],
      "4xl": ["48px", "58px"],
      "8xl": ["96px", "106px"],
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        primary: "#000000",
        "light-blue": "#F2F5FF",
        "text-gray": "#828080",
        "text-primary": "#313131",
        "dark-gray": "#635E5E",
      },
      boxShadow: {
        "3xl": "0 10px 40px rgba(0, 0, 0, 0.1)",
      },
      screens: {
        wide: "1440px",
      },
      animation: {
        fadeIn: "fadeIn .5s ease-in-out",
        fadeIn7: "fadeIn7 .3s ease-in-out forwards",
        fadeOut: "fadeOut .5s ease-in-out forwards",
        moveIn: "moveIn .5s ease-in-out forwards",
        moveOut: "moveOut .5s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeIn7: {
          from: { opacity: 0 },
          to: { opacity: 0.7 },
        },
        fadeOut: {
          from: { opacity: 0.7 },
          to: { opacity: 1 },
        },
        moveIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        moveOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
