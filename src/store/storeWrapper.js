import clone from 'clone';
import { toCamelCase } from '../common/helpers.js';

/**
 * Private method that modifies magics strings to contain their parents
 * @param {Object} api - object tree with magic strings
 * @param {string} parentName - parentName
 * @returns {Object} all tree nodes have been padded with parentName '/'
 */
function addParentToPath(subapi, parentName) {
  const result = {};
  Object.keys(subapi).forEach((type) => {
    if (type === 'get' || type === 'act' || type === 'mutate') {
      result[type] = {};
      Object.keys(subapi[type]).forEach((pathName) => {
        const path = subapi[type][pathName];
        result[type][pathName] = parentName + '/' + path;
      });
    } else {
      result[type] = addParentToPath(subapi[type], parentName);
    }
  });

  return result;
}

/**
 * Modify Vuex Module to contain an api with magic strings
 * Requirement: store.name has to be available
 * @param {Object} store - Vuex module store
 * @returns {Object} Store with added `api` parameter
 */
export default function (store) {
  store.api = {};
  store.namespaced = true;

  const camelCasedName = toCamelCase(store.name);

  // Clone getters
  if (store.getters) {
    store.api.get = {};
    Object.keys(store.getters).forEach((name) => {
      store.api.get[name] = camelCasedName + '/' + name;
    });
  }

  // Clone actions
  if (store.actions) {
    store.api.act = {};
    Object.keys(store.actions).forEach((name) => {
      store.api.act[name] = camelCasedName + '/' + name;
    });
  }

  // Clone mutations
  if (store.mutations) {
    store.api.mutate = {};
    Object.keys(store.mutations).forEach((name) => {
      store.api.mutate[name] = camelCasedName + '/' + name;
    });
  }

  // Clone modules
  if (store.modules) {
    Object.keys(store.modules).forEach((name) => {
      store.api[name] = addParentToPath(store.modules[name].api, camelCasedName);
    });
  }

  store.$api = clone(store.api, false);

  return store;
}
