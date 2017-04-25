import contextHmr from 'webpack-context-vuex-hmr';

import storeWrapper from './instanceHandling/storeWrapper.js';
import { hmrHandler, setStore } from './instanceHandling/hmrHandler.js';
import { getLocalPath } from './instanceHandling/helpers.js';
import { add, setup } from './instanceHandling/addStore.js';
import * as apiManager from './instanceHandling/api.js';

export const addStore = add;

function searchDeeper(map, key, log) {
  const submodules = Object.keys(map).filter(k => k !== 'get' && k !== 'act' && k !== 'mutate');
  const keyIsInMap = submodules.indexOf(key) >= 0;

  if (keyIsInMap) {
    return map[key];
  }

  // TODO Speed up with some nice algorithm
  let result;
  submodules.forEach((submodule) => {
    const searchResult = searchDeeper(map[submodule], key);
    if (searchResult) {
      result = searchResult;
    }
  });

  return result;
}

function getFullPath(config) {
  const suffix = config.subinstance ? '#' + config.subinstance : '';
  const getterKey = config.mappedKey.match(/[a-zA-Z]*/)[0];

  let localApi = apiManager.api[config.vuexPlus.baseStoreName];
  if (getterKey !== config.vuexPlus.baseStoreName) {
    localApi = searchDeeper(apiManager.api[config.vuexPlus.baseStoreName], getterKey + suffix);
  }
  return localApi[config.method][config.key].replace(config.vuexPlus.baseStoreName, config.vuexPlus.storeInstanceName);
}

export const map = {
  getters(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function get() {
        const path = getFullPath({
            method: 'get',
            key,
            mappedKey: m[key],
            subinstance: this.subinstance,
            vuexPlus: this['$vuex+']
        });

        // localApi.get[key].replace(this['$vuex+'].baseStoreName, this['$vuex+'].storeInstanceName)
        return this.$store.getters[path];
      };
    });
    return result;
  },

  actions(m) {
    const result = {};
    Object.keys(m).forEach((key) => {
      result[key] = function dispatch(payload) {
        const path = getFullPath({
            method: 'act',
            key,
            mappedKey: m[key],
            subinstance: this.subinstance,
            vuexPlus: this['$vuex+']
        });
        return this.$store.dispatch(path, payload);
      };
    });
    return result;
  },
};

/**
 * Modify Vuex Module to contain an api with magic strings
 * Requirement: store.name has to be available
 * ```
 * export default store({
 *   name: 'foo',
 *   state: initialState,
 *   getters,
 *   actions,
 *   mutations,
 *   modules: {
 *     bar,
 *   },
 * });
 * ```
 * The wrapper will add `object.api`:
 * {
 *  get: {
 *    getter1, // { String }
 *    getter2, // { String }
 *  },
 *  act: {
 *    action1, // { String }
 *    action2, // { String }
 *  },
 *  mutate: {
 *    mutation1, // { String }
 *    mutation2, // { String }
 *  },
 * }
 */
export const store = storeWrapper;

export const hmrCallback = hmrHandler;

/**
 * Global api with magical strings to all root modules
 * @returns {Object} - Object with magical strings
 */
export const api = apiManager.api;

/**
 * Method that returns a getter from the same instance.
 * @param {string} - Path as as string, usually from api. Eg. `api.example.get.something`
 * @param {Context} - Vuex context
 * @returns {any} - Value from Vuex getter
 */
export const instance = {
  get({ path, context }) {
    const localPath = getLocalPath(path, context);

    return context.rootGetters[localPath];
  },

  dispatch({ path, data, context }) {
    const localPath = getLocalPath(path, context);

    return context.dispatch(localPath, data, { root: true });
  },

  commit({ path, data, context }) {
    const localPath = getLocalPath(path, context);

    return context.commit(localPath, data, { root: true });
  },
};

let setupDone = false;
export default {
  install(Vue) {
    Vue.mixin({
      created() {
        if (!setupDone && this.$store) {
          setStore(this.$store);
          const importer = contextHmr.getNewInstance();
          apiManager.generateAPI(importer);
          setup(importer);
          importer.getModules();
          importer.setupHMR(hmrHandler);
          setupDone = true;
        }

        const findModuleName = (parent) => {
          if (!this['$vuex+'] && parent.$parent) {
            // console.info(parent.$parent.name, parent.$parent);
            if (!parent.$parent['$vuex+']) {
              findModuleName(parent.$parent, '/');
            } else {
              // console.info('found [vuex+]', parent.$parent['$vuex+'].baseStoreName);
              this['$vuex+'] = {
                baseStoreName: parent.$parent['$vuex+'].baseStoreName,
                storeInstanceName: parent.$parent['$vuex+'].storeInstanceName,
              };
            }
          }
        };

        // console.info('finding', this.$options['_componentTag']);
        findModuleName(this, '/');
      },
    });
  },
};
