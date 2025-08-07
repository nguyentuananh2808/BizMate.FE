/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vkStart: "#60A5FA", // xanh nhạt (light blue-400)
        vkEnd: "#2563EB", // xanh đậm (blue-600)
        vkDarkStart: "#93C5FD", // màu sáng hơn trong dark mode
        vkDarkEnd: "#3B82F6", // màu đậm hơn trong dark mode
        primary: {
          light: "#3B82F6", // blue-500
          dark: "#60A5FA", // blue-400
        },
        secondary: {
          light: "#2563EB",
          dark: "#FFFF", // blue-600
        },
        background: {
          light: "#EFF6FF", // light blue-gray
          dark: "rgb(17 24 39)", // dark navy
          lightblue: "rgba(171,211,249,0.76)",
        },
        "text-primary": {
          light: "#1E293B", // slate-800
          dark: "#E0E7FF", // light blue-100
        },
        "text-secondary": {
          light: "#475569", // slate-600
          dark: "#A5B4FC", // blue-300
        },
        "card-bg": {
          light: "#DCEEFB", // very light blue
          dark: "#1E293B", // dark slate
        },

        // New extended colors
        success: {
          light: "#34D399", // emerald-400
          dark: "#10B981", // emerald-500
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
