const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Anchored to this config's directory so globs resolve correctly even when
  // `next dev` is launched from a parent working directory.
  content: [
    path.join(__dirname, "app/**/*.{js,jsx}"),
    path.join(__dirname, "components/**/*.{js,jsx}"),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
