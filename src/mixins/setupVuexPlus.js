import contextHmr from 'webpack-context-vuex-hmr';
import { setup } from './register.js';
import { hmrHandler } from '../common/hmrHandler.js';
import vuexInstance from '../vuexInstance.js';
import { toCamelCase } from '../common/helpers.js';

/**
 * Setup vuex plus with the base vuex store
 * @param  {Object} $store Base vuex store
 */
export default function setupVuexPlus($store) {
  vuexInstance.store = $store;
  const importer = contextHmr.getNewInstance();
  setup(importer);
  const modules = importer.getModules();
  // Add normal vuex modules
  Object.keys(modules).forEach((moduleName) => {
    const baseStoreName = toCamelCase(moduleName.replace(/-store$/, ''));
    if (!modules[moduleName].state || (modules[moduleName].state && !modules[moduleName].state['vuex+'])) {
      $store.registerModule(baseStoreName, modules[moduleName]);
    }
  });
  importer.setupHMR(hmrHandler);
}
