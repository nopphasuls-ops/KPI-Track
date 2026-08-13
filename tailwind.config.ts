import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // ใช้ Noto Sans Thai เป็นฟอนต์หลักทั้งโปรเจกต์
        sans: ["var(--font-noto-sans-thai)", "sans-serif"],
      },
      colors: {
        // โทนสีหลัก: น้ำเงิน–ขาว–ทอง
        brand: {
          blue: "#1E3A8A",
          "blue-light": "#2563EB",
          gold: "#D4AF37",
          "gold-light": "#EAB308",
        },
      },
    },
  },
  plugins: [],
};

export default config;
