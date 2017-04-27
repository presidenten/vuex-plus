import contextHmr from 'webpack-context-vuex-hmr';
import { setup } from './addStore.js';
import { hmrHandler } from '../common/hmrHandler.js';
import vuexInstance from '../vuexInstance.js';

export default function setupVuexPlus($store) {
  vuexInstance.store = $store;
  const importer = contextHmr.getNewInstance();
  setup(importer);
  importer.getModules();
  importer.setupHMR(hmrHandler);
}
