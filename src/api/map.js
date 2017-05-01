import { getTagName, getParentInstances } from '../common/helpers.js';
import { getFullPath } from './api.js';

export default {
  /**
   * Map local paths `require('./example-substore.js').api.get.value`
   * to the corresponding vuex getter.
   * @param {Object} m - Object of all computed properties to be mapped to getters
   * @returns {Object} - Object containing the mapped getters
   */
  getters(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function get() {
        const parentInstances = getParentInstances(this);
        if (m[key]) {
          const subInstances = m[key].match(/\$\w*/g);
          if (subInstances) {
            subInstances.forEach((instance) => {
              parentInstances.push(instance);
            });
          }
        }
        const path = getFullPath({
          subpath: m[key],
          instance: this.instance,
          parentInstances,
          vuexPlus: this['$vuex+'],
          container: getTagName(this),
        });
        return this.$store.getters[path];
      };
    });
    return result;
  },

  /**
   * Map local paths `require('./example-substore.js').api.act.value`
   * to the corresponding vuex getter.
   * @param {Object} m - Object of all method properties to be mapped to actions
   * @returns {Object} - Object containing the mapped actions
   */
  actions(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function dispatch(payload) {
        const parentInstances = getParentInstances(this);
        if (m[key]) {
          const subInstances = m[key].match(/\$\w*/g);
          if (subInstances) {
            subInstances.forEach((instance) => {
              parentInstances.push(instance);
            });
          }
        }
        const path = getFullPath({
          subpath: m[key],
          instance: this.instance,
          parentInstances,
          vuexPlus: this['$vuex+'],
          container: getTagName(this),
        });
        return this.$store.dispatch(path, payload);
      };
    });
    return result;
  },
};
