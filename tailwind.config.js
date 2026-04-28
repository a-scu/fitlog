/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./index.js", "./screens/**/*.{js,jsx,ts,tsx}", "./navigation/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // NativeWind v4 uses 'media' to respect OS dark mode preference.
  // For manual toggling, call Appearance.setColorScheme() from React Native.
  darkMode: "media",
  theme: {
    extend: {
      borderWidth: {
        1.5: "1.5px",
      },
    },
  },
  plugins: [],
};
