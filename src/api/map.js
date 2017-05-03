
import { getFullPath } from './api.js';

export default {
  /**
   * Map local paths `require('./example-substore.js').api.get.value`
   * to the corresponding vuex getter.
   * @param {Object} map - Object of all computed properties to be mapped to getters
   * @returns {Object} - Object containing the mapped getters
   */
  getters(map) {
    const result = {};
    Object.keys(map).forEach((key) => {
      result[key] = function get() {
        const path = getFullPath(map[key], this);
        return this.$store.getters[path];
      };
    });
    return result;
  },

  /**
   * Map local paths `require('./example-substore.js').api.act.value`
   * to the corresponding vuex getter.
   * @param {Object} map - Object of all method properties to be mapped to actions
   * @returns {Object} - Object containing the mapped actions
   */
  actions(map) {
    const result = {};
    Object.keys(map).forEach((key) => {
      result[key] = function dispatch(payload) {
        const path = getFullPath(map[key], this);
        return this.$store.dispatch(path, payload);
      };
    });
    return result;
  },
};
