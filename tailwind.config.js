/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adega: {
          bg: "var(--adega-bg)",
          card: "var(--adega-card)",
          text: "var(--adega-text)",
          muted: "var(--adega-muted)",
          border: "var(--adega-border)",
          success: "#10B981",
          danger: "#EF4444",
          primary: "var(--adega-primary)",
        }
      }
    },
  },
  plugins: [],
}