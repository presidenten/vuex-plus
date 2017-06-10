import clone from 'clone';
import vuexInstance from '../vuexInstance.js';

/**
 * Create new namespaced store instance
 * @param {string} storeInstanceName - The full instance name
 * @param {string} instance - Instance name, same as in `instance="my-counter"`
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @param {Object} store - The base store name, same as in `store({ name })`
 * @returns {Object} Vuex module store with submodules
 */
export default function newStore(storeInstanceName, instance, baseStoreName, store, parent) {
  const resultingStore = {
    namespaced: true,
  };

  Object.assign(resultingStore, store);
  resultingStore.state = {};
  if (store.state) {
    resultingStore.state = clone(store.state, false);
  }

  if (!parent) {
    parent = vuexInstance.store.state;
  }
  Object.defineProperty(resultingStore.state, '$parent', { get() { return parent; } });

  resultingStore.state['vuex+'] = {};
  if (instance) {
    resultingStore.state['vuex+'].rootInstance = instance;
  }
  resultingStore.state['vuex+'].storeName = baseStoreName;
  ['actions', 'getters', 'mutations'].forEach((type) => {
    if (store[type]) {
      resultingStore[type] = {};
      Object.keys(store[type]).forEach((name) => {
        const newName = name.replace(baseStoreName, storeInstanceName);
        resultingStore[type][newName] = store[type][name];
      });
    }
  });
  if (resultingStore.modules) {
    resultingStore.modules = {};
    Object.keys(store.modules).forEach((subInstanceName) => {
      resultingStore.modules[subInstanceName] = newStore(storeInstanceName, instance, baseStoreName, store.modules[subInstanceName], resultingStore.state); // eslint-disable-line
    });
  }

  return resultingStore;
}
