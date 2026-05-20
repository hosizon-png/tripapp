/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tripsy Design System
        background: {
          light: "#F8F7F4",    // warm white
          dark: "#1C1C1E",     // near black
        },
        surface: {
          light: "#FFFFFF",
          dark: "#2C2C2E",
        },
        text: {
          primary: {
            light: "#1C1C1E",
            dark: "#F5F5F7",
          },
          secondary: {
            light: "#8E8E93",
            dark: "#98989D",
          },
        },
        separator: {
          light: "#E5E5EA",
          dark: "#38383A",
        },
        // Itinerary item type colors
        flight: "#007AFF",
        hotel: "#AF52DE",
        activity: "#FF9500",
        restaurant: "#FF3B30",
        transport: "#007AFF",
        note: "#34C759",
        // Subscription tier colors
        pro: "#007AFF",
        plus: "#AF52DE",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "trip-title": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "section-title": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "item-title": ["17px", { lineHeight: "22px", fontWeight: "500" }],
        body: ["15px", { lineHeight: "20px" }],
        caption: ["13px", { lineHeight: "18px" }],
      },
      borderRadius: {
        card: "16px",
        sheet: "24px",
      },
    },
  },
  plugins: [],
};
