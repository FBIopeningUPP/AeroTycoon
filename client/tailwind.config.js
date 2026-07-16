const { nextui } = require("@nextui-org/react");

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [
        nextui({
          defaultTheme: "dark",
          themes: {
            dark: {
              colors: {
                background: "#05070f",
                primary: {
                  DEFAULT: "#00f0ff",
                  foreground: "#000000",
                },
                secondary: {
                  DEFAULT: "#b026ff",
                  foreground: "#ffffff",
                }
              }
            }
          }
        })
    ],
} 