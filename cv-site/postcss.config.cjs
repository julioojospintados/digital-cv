/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // @custom-media → media query nominali condivise in tutto il CSS del
    // progetto. Unico plugin PostCSS: lo styling è fatto a mano con CSS
    // custom properties + file per-sezione, senza framework di utility.
    "postcss-custom-media": {},
  },
};
