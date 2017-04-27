import { hmrHandler } from './common/hmrHandler.js';
import setupVuexPlus from './mixins/setupVuexPlus.js';

import _map from './api/map.js';
import _global from './api/global.js';
import _store from './store/storeWrapper.js';
import _addStore from './mixins/addStore.js';
import _newInstance from './store/newInstance';
import _vuePluginInstall from './mixins/install.js';

export const map = _map;
export const store = _store;
export const global = _global;
export const addStore = _addStore;
export const hmrCallback = hmrHandler;
export const newInstance = _newInstance;

export const connectStore = setupVuexPlus;

export default _vuePluginInstall;
