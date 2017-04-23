import contextHmr from 'webpack-context-vuex-hmr';

import storeWrapper from './instanceHandling/storeWrapper.js';
import * as instanceHandler from './instanceHandling/use.js';
import { hmrHandler, setStore } from './instanceHandling/hmrHandler.js';
import { getStoreInstanceName, getLocalPath } from './instanceHandling/helpers.js';


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
export const api = instanceHandler.api;

/**
 * Method that defines which Vuex module store to use
 * @param {string} - Instance name as string, `example-sto
 * @returns {Object} - `{ mapActions, mapActions, mixins }` where `mixins`
 *                      contains `addStore` and `useStore`.
 */
export const use = instanceHandler.use;

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
  install(Vue, options) {
    Vue.mixin({
      created() {
        if(!setupDone && this.$store) {
          setStore(this.$store);
          const importer = contextHmr.getNewInstance();
          instanceHandler.setup(importer);
          importer.getModules();
          importer.setupHMR(hmrHandler);
          setupDone = true;
        }

        const findModuleName = (parent) => {
          if (!this.storeInstanceName && parent.$parent) {
            if (!parent.$parent.storeInstanceName) {
              findModuleName(parent.$parent);
            } else {
              this.storeInstanceName = parent.$parent.storeInstanceName;
            }
          }
        };

        findModuleName(this);
      },
    });
  },
}
