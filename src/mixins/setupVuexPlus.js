import contextHmr from 'webpack-context-vuex-hmr';
import { setup } from './addStore.js';
import { hmrHandler, setStore } from '../common/hmrHandler.js';

export default function setupVuexPlus($store) {
  setStore($store);
  const importer = contextHmr.getNewInstance();
  setup(importer);
  importer.getModules();
  importer.setupHMR(hmrHandler);
}
