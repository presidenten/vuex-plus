export default {
  install(Vue) {
    Vue.mixin({
      props: ['instance'],
      created() {
        const findModuleName = (parent) => {
          if (!this['$vuex+'] && parent.$parent) {
            if (!parent.$parent['$vuex+']) {
              findModuleName(parent.$parent);
            } else {
              this['$vuex+'] = {
                baseStoreName: parent.$parent['$vuex+'].baseStoreName,
                storeInstanceName: parent.$parent['$vuex+'].storeInstanceName,
              };
            }
          }
        };

        findModuleName(this);
      },
    });
  },
};
