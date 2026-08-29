module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  plugins: [],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins_400Regular"],
        semibold: ["Poppins_600SemiBold"],
        bold: ["Poppins_700Bold"],
      },
      colors: {
        // Espelha src/theme.js — mantenha os dois em sincronia.
        brand: {
          DEFAULT: "#FFB800",
          dark: "#8A5A00",
          deep: "#5B4101",
          tint: "#FFF4D6",
        },
        "on-brand": "#1A1206",
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#525252",
          faint: "#A3A3A3",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F5F5F5",
        },
        line: "#E5E5E5",
      },
      borderRadius: {
        xl2: "24px",
      },
    },
  },
};
