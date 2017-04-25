import { toCamelCase } from './helpers.js';

/**
 * Private method that modifies magics strings to contain their parents
 */
function addModuleToNames(name, subapi, instanceName) {
  const result = {};
  Object.keys(subapi).forEach((type) => {
    if (type === 'get' || type === 'act' || type === 'mutate') {
      result[type] = {};
      Object.keys(subapi[type]).forEach((pathName) => {
        const path = subapi[type][pathName];
        const subname = path.match(/[a-zA-Z]*/)[0];
        result[type][pathName] = name + '/' + path;
        if (instanceName) {
          result[type][pathName] = result[type][pathName].replace(subname, subname + '#' + instanceName);
        }
      });
    } else {
      result[type] = addModuleToNames(name, subapi[type]);
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
      const hashPos = name.indexOf('#');
      const instanceName = hashPos >= 0 ? name.slice(hashPos + 1) : undefined;

      store.api[name] = addModuleToNames(camelCasedName, store.modules[name].api, instanceName);
    });
  }

  return store;
}
