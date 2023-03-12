/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Rozha One'", "serif"],
        sans: ["'Rubik'", "sans-serif"],
      },
      animation: {
        success: "success 0.2s ease 1 forwards",
        growAndSpin: "growAndSpin 0.3s cubic-bezier(.43,.01,.61,.9) 1 forwards",
      },
      keyframes: {
        success: {
          from: {
            opacity: 0,
            transform: `translate(0, 20px)`,
          },
          to: {
            opacity: 1,
            transform: `translate(0, 0)`,
          },
        },
        growAndSpin: {
          from: {
            transform: `scale(0)`,
          },
          to: {
            transform: `scale(1) rotate(180deg)`,
          },
        },
      },
    },
  },
  plugins: [],
};
