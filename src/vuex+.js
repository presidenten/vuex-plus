import { hmrHandler } from './common/hmrHandler.js';
import setupVuexPlus from './mixins/setupVuexPlus.js';

import _map from './api/map.js';
import _root from './api/root.js';
import _store from './store/storeWrapper.js';
import _addStore from './mixins/addStore.js';
import _newInstance from './store/newInstance';
import _vuePluginInstall from './mixins/install.js';

export const map = _map;
export const store = _store;
export const root = _root;
export const register = _addStore;
export const hmrCallback = hmrHandler;
export const newInstance = _newInstance;

export default {
  getVuePlugin(Vue) { // eslint-disable-line
    return _vuePluginInstall;
  },
  getVuexPlugin(Vuex) {
    // Add $parent to all vuex models states
    function setParents(parent) {
      Object.keys(parent).forEach((prop) => {
        if (prop !== 'vuex+' && typeof parent[prop] === 'object' && parent[prop]['vuex+']) {
          setParents(parent[prop]);
          Object.defineProperty(parent[prop], '$parent', { get() { return parent; } });
        }
      });
    }

    // Patch replaceState to set $parent to all states on updates state
    const org = Vuex.Store.prototype.replaceState;
    Vuex.Store.prototype.replaceState = function replacestate(newState) {
      setParents(newState);
      org.call(this, newState);
    };

    return setupVuexPlus;
  },
};
