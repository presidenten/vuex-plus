import { getFullPath } from './api.js';

export default {
  getters(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function get() {
        const path = getFullPath({
          method: 'get',
          key,
          subpath: m[key],
          instance: this.instance,
          vuexPlus: this['$vuex+'],
          container: this.$parent.$vnode.componentOptions.tag,
        });

        return this.$store.getters[path];
      };
    });
    return result;
  },

  actions(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function dispatch(payload) {
        const path = getFullPath({
          method: 'act',
          key,
          subpath: m[key],
          instance: this.instance,
          vuexPlus: this['$vuex+'],
          container: this.$parent.$vnode.componentOptions.tag,
        });

        return this.$store.dispatch(path, payload);
      };
    });
    return result;
  },
};
