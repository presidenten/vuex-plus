import clone from 'clone';
import { api } from './api.js';
import { getLocalPath } from '../common/helpers.js';
import vuexInstance from '../vuexInstance.js';

export default {
  /**
   * Get the whole global api
   * @return {Object} Global api
   */
  get api() {
    return clone(api);
  },

  /**
   * Method that returns a getter.
   * Only set `state` when getting from same instance
   * @param {string} path - Path as as string, usually from api. Eg. `api.example.get.something`
   * @param {Object} state - Optional local vuex state. Set it when searching in same instance.
   * @returns {any} - Value from Vuex getter
   */
  get({ path, state }) {
    if (state) {
      const localPath = getLocalPath(path, state);
      return vuexInstance.store.getters[localPath];
    }

    return vuexInstance.store.getters[path];
  },

  /**
   * Method that dispatches an action.
   * Only set `state` when dispatching in same instance
   * @param {string} path - Path as as string, usually from api. Eg. `api.example.get.something`
   * @param {any} data - Optional data to pass along with action.
   * @param {Object} state - Optional local vuex state. Set it when searching in same instance.
   * @returns {any} - Value from Vuex action
   */
  dispatch({ path, data, state }) {
    if (state) {
      const localPath = getLocalPath(path, state);
      return vuexInstance.store.dispatch(localPath, data);
    }

    return vuexInstance.store.dispatch(path, data);
  },

  /**
   * Method that commits a mutation.
   * Only set `state` when commiting in same instance
   * @param {string} path - Path as as string, usually from api. Eg. `api.example.get.something`
   * @param {any} data - Optional data to pass along with mutation.
   * @param {Object} state - Optional local vuex state. Set it when searching in same instance.
   * @returns {any} - Value from Vuex mutation
   */
  commit({ path, data, state }) {
    if (state) {
      const localPath = getLocalPath(path, state);
      return vuexInstance.store.commit(localPath, data);
    }

    return vuexInstance.store.commit(path, data);
  },
};
