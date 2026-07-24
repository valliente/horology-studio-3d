/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pro: {
          bg: "#0d0f14",
          card: "#161a23",
          hover: "#1e2430",
          border: "#242b3b",
          cyan: "#00F5D4",
          purple: "#9D4EDD",
          blue: "#3B82F6",
          amber: "#FFB000",
          green: "#00FF66",
          red: "#FF3355",
          text: "#F1F5F9",
          muted: "#94A3B8",
          dim: "#475569",
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 245, 212, 0.35), 0 0 30px rgba(0, 245, 212, 0.15)',
        'purple-glow': '0 0 15px rgba(157, 78, 221, 0.35), 0 0 30px rgba(157, 78, 221, 0.15)',
        'blue-glow': '0 0 15px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.2)',
        'card-shadow': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
