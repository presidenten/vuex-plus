import { api, remapBaseStore } from '../api/api.js';
import { toCamelCase } from './helpers.js';
import vuexInstance from '../vuexInstance.js';

let handlers = [];

/**
 * Returns all current vuex module handlers
 * @return {array} All current vuex module handlers
 */
export const getHandlers = () => handlers.slice();
/**
 * Clears the current vuex module handlers
 */
export const clearHandlers = () => {
  handlers = [];
};

/**
 * Registers module for HMR
 * @param  {Object} newStore          The store object
 * @param  {string} baseStoreName     Base store name
 * @param  {string} storeInstanceName Store instance name
 */
export const registerForHMR = (newStore, baseStoreName, storeInstanceName) => {
  handlers.push({
    storeName: baseStoreName + '-store',
    storeInstanceName,
    newStore,
  });
};

/**
 * Unregisters for HMR
 * @param  {Object} newStore The store object
 */
export const unregisterForHMR = (newStore) => {
  handlers = handlers.filter(h => h.newStore !== newStore);
};

/**
 * The hmr handler
 * @param  {array} updatedModules All the updated modules returned from HMR plugin
 */
export const hmrHandler = (updatedModules) => {
  const modules = {};
  Object.keys(updatedModules).forEach((key) => {
    const storeName = toCamelCase(key.replace('-store', '')) + '-store';
    handlers
      .filter(handler => handler.storeName === storeName)
      .forEach((handler) => {
        modules[handler.storeInstanceName] = handler.newStore(updatedModules[key]);
      });

    Object.keys(modules).forEach((m) => {
      api[m] = remapBaseStore(modules[m].$api, modules[m].name, m);
    });
    vuexInstance.store.hotUpdate({ modules });
  });
};
