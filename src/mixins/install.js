import setupVuexPlus from './setupVuexPlus.js';

let setupDone = false;
export default {
  install(Vue) {
    Vue.mixin({
      props: ['instance'],
      created() {
        if (!setupDone && this.$store) {
          setupVuexPlus(this.$store);
          setupDone = true;
        }

        const findModuleName = (parent) => {
          if (!this['$vuex+'] && parent.$parent) {
            if (!parent.$parent['$vuex+']) {
              findModuleName(parent.$parent, '/');
            } else {
              this['$vuex+'] = {
                baseStoreName: parent.$parent['$vuex+'].baseStoreName,
                storeInstanceName: parent.$parent['$vuex+'].storeInstanceName,
              };
            }
          }
        };

        findModuleName(this, '/');
      },
    });
  },
};
