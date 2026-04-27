/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  darkMode: "class",
  theme: {
    extend: {
    keyframes: {
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-15deg)' },
          '75%': { transform: 'rotate(15deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-25deg)' },
          '40%': { transform: 'rotate(25deg)' },
          '60%': { transform: 'rotate(-20deg)' },
          '80%': { transform: 'rotate(20deg)' },
        },
      },
      animation: {
        shake: 'shake 1.5s ease-in-out infinite',   // lắc nhẹ
        wiggle: 'wiggle 0.6s ease-in-out infinite', // lắc mạnh
      },
    
      colors: {
        vkStart: "#14B8A6", // teal-500
        vkEnd: "#155E75", // cyan-800
        vkDarkStart: "#5EEAD4", // teal-300
        vkDarkEnd: "#E2E8F0", // slate-200
        primary: {
          light: "#0F766E", // teal-700
          dark: "#5EEAD4", // teal-300
        },
        secondary: {
          light: "#155E75",
          dark: "#E2E8F0",
        },
        background: {
          light: "#F4F7F8",
          dark: "#0B1520",
          lightblue: "#E8F1F5",
        },
        "text-primary": {
          light: "#102331",
          dark: "#E8F2F7",
        },
        "text-secondary": {
          light: "#506675",
          dark: "#AFC1CB",
        },
        "card-bg": {
          light: "#FFFFFF",
          dark: "#101D2A",
        },

        // New extended colors
        success: {
          light: "#059669", // emerald-600
          dark: "#34D399", // emerald-400
        },
        warning: {
          light: "#FBBF24", // yellow-400
          dark: "#D97706", // amber-700
        },
        danger: {
          light: "#F87171", // red-400
          dark: "#EF4444", // red-500
        },
        info: {
          light: "#60A5FA", // blue-400
          dark: "#3B82F6", // blue-500
        },

        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },

        accent: {
          light: "#A78BFA", // violet-400
          dark: "#7C3AED", // violet-600
        },
        teal: {
          light: "#5EEAD4", // teal-300
          dark: "#14B8A6", // teal-500
        },
        orange: {
          light: "#FDBA74", // orange-300
          dark: "#F97316", // orange-500
        },
      },
    },
  },
  plugins: [],
};
