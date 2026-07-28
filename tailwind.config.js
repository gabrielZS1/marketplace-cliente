module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],

  theme: {
  extend: {
    fontFamily: {
      sans: ["Poppins_400Regular"],
      semibold: ["Poppins_600SemiBold"],
      bold: ["Poppins_700Bold"],
    },
  },
},

}

