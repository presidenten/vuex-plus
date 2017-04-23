const buble = require('rollup-plugin-buble');

module.exports = {
  exports: 'named',
  entry: 'src/vuex+.js',
  dest: 'dist/vuex+.js',
  format: 'es',
  plugins: [ buble() ],
};
