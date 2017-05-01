const buble = require('rollup-plugin-buble');

module.exports = {
  exports: 'named',
  entry: 'src/vuex+.js',
  dest: 'dist/vuex+.js',
  format: 'cjs',
  plugins: [buble()],
  external: ['webpack-context-vuex-hmr', 'clone'],
};
