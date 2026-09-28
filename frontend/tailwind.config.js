// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }


export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        meet: {
          bg: "#0F1117",
          card: "#1A1F2E",
          input: "#252B3B",
          purple: "#6D5FD5",
          purpleHover: "#5A4EC0",
          purpleLight: "#7B93FF",
          text: "#FFFFFF",
          muted: "#8B94A8",
          line: "rgba(255, 255, 255, 0.08)",
          ring: "rgba(109, 95, 213, 0.3)",
        },
      },
      boxShadow: {
        meet: "0 8px 32px -8px rgba(0, 0, 0, 0.45), 0 2px 12px -2px rgba(0, 0, 0, 0.35)",
        "meet-sm": "0 4px 20px -4px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        "meeting-feature-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "meeting-feature-fade": "meeting-feature-fade 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
}
