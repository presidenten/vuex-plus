import storeWrapper from './instanceHandling/storeWrapper.js';
import * as instanceHandler from './instanceHandling/use.js';
import { hmrHandler, setStore } from './instanceHandling/hmrHandler.js';
import { getStoreInstanceName } from './instanceHandling/helpers.js';


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

/**
 * needed!
 */
export const setup = (importer, vuexStore) => {
  instanceHandler.setup(importer);
  setStore(vuexStore);
};

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

function getLocalPath(path, context) {
  const storeName = context.state['vuex+'].storeName;
  const instance = context.state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
}
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
