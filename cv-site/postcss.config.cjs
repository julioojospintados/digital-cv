/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // @custom-media → media query nominali in tutto il CSS del progetto.
    // Tailwind v4 usa il suo Vite plugin — postcss-custom-media opera
    // sulla pipeline PostCSS standard di Vite per tutti gli altri file CSS.
    'postcss-custom-media': {},
  },
};
