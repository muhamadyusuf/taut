import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // PENTING: Tambahkan ini
  theme: {
    extend: {
      backgroundImage: {
        'gemini-gradient': 'linear-gradient(to right, #4b90ff, #ff5546)', // Gradasi a la Gemini
      },
      colors: {
        // Warna background custom untuk dark mode agar mirip Gemini Dark
        dark: {
          bg: '#131314',
          surface: '#1e1f20',
          border: '#444746'
        }
      }
    },
  },
  plugins: [],
};
export default config;