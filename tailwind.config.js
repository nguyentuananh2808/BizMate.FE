/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}" // Quan trọng để Tailwind biết cần quét file nào
  ],
  darkMode: 'class', // hoặc 'media' nếu bạn thích auto theo hệ điều hành
  theme: {
    extend: {},
  },
  plugins: [],
}
