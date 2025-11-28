// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},  // 👈 this actually processes @import "tailwindcss"
    autoprefixer: {},            // keep this for vendor prefixes
  },
};