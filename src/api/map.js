import { getFullPath } from './api.js';

const getTagName = (self) => {
  let tag = '-unknown-';
  if (self.$parent) {
    const vnode = self.$parent.$vnode || self.$parent._vnode; // eslint-disable-line

    if (vnode && vnode.componentOptions && vnode.componentOptions.tag) {
      tag = vnode.componentOptions.tag;
    }
  }
  return tag;
};

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
          container: getTagName(this),
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
          container: getTagName(this),
        });
        return this.$store.dispatch(path, payload);
      };
    });
    return result;
  },
};
