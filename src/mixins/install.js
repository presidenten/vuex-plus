import contextHmr from 'webpack-context-vuex-hmr';

import { setup } from './addStore.js';
import { hmrHandler, setStore } from '../common/hmrHandler.js';

let setupDone = false;
export default {
  install(Vue) {
    Vue.mixin({
      props: ['instance'],
      created() {
        if (!setupDone && this.$store) {
          setStore(this.$store);
          const importer = contextHmr.getNewInstance();
          setup(importer);
          importer.getModules();
          importer.setupHMR(hmrHandler);
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
