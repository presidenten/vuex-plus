
import { getFullPath } from './api.js';

const generateMappingFunction = (method, mappingVuexPaths) => {
  const result = {};
  const pathKey = Object.keys(mappingVuexPaths)[0];
  let moduleName = '';
  if (pathKey) {
    if (!mappingVuexPaths[pathKey].toString().includes('/')) {
      console.error('[Vuex+] Vuex path not namespaced in mapping function! Got:\n' + JSON.stringify(mappingVuexPaths, undefined, 2));
      return undefined;
    }
    const vuexPath = mappingVuexPaths[pathKey];
    moduleName = vuexPath.slice(0, mappingVuexPaths[pathKey].indexOf('/'));
  }

  Object.keys(mappingVuexPaths).forEach((key) => {
    result[key] = function map(payload) {
      if (!this['$vuex+'].moduleName && moduleName) {
        this['$vuex+'].moduleName = this['$vuex+'].moduleName || moduleName;
      }
      const path = getFullPath(mappingVuexPaths[key], this);
      if (method === 'getters') {
        result[key].vuex = true; // Mark getter for devtools
        return this.$store[method][path];
      }
      return this.$store[method](path, payload);
    };
  });

  return result;
};

export default {
  /**
   * Map local paths `require('./example-substore.js').api.get.value`
   * to the corresponding vuex getter.
   * @param {Object} map - Object of all computed properties to be mapped to getters
   * @returns {Object} - Object containing the mapped getters
   */
  getters(mappingVuexPaths) {
    return generateMappingFunction('getters', mappingVuexPaths);
  },

  /**
   * Map local paths `require('./example-substore.js').api.act.value`
   * to the corresponding vuex action.
   * @param {Object} map - Object of all method properties to be mapped to actions
   * @returns {Object} - Object containing the mapped actions
   */
  actions(mappingVuexPaths) {
    return generateMappingFunction('dispatch', mappingVuexPaths);
  },
};
