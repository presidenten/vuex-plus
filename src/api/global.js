import clone from 'clone';
import { api } from './api.js';
import { getStoreInstanceName } from '../common/helpers.js';
import vuexInstance from '../vuexInstance.js';

const getLocalPath = (path, state) => {
  const storeName = state['vuex+'].storeName;
  const instance = state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};

/**
 * Method that returns a getter from the same instance.
 * @param {string} - Path as as string, usually from api. Eg. `api.example.get.something`
 * @param {Context} - Vuex context
 * @returns {any} - Value from Vuex getter
 */
export default {
  get api() {
    return clone(api);
  },

  get({ path, context, state, local }) {
    if (!state && !context) {
      console.error('Cant global.get without `store` or `context`');
    }
    if (local) {
      const localPath = getLocalPath(path, state || context.state);
      if (context) {
        return context.rootGetters[localPath];
      }
      return vuexInstance.store.getters[localPath];
    }

    if (context) {
      return context.rootGetters[path];
    }
    return vuexInstance.store.getters[path];
  },

  dispatch({ path, data, context, local }) {
    if (!context) {
      console.error('Cant global.dispatch without `context`');
    }
    if (local) {
      const localPath = getLocalPath(path, context.state);
      return context.dispatch(localPath, data, { root: true });
    }

    return context.dispatch(path, data, { root: true });
  },

  commit({ path, data, context, local }) {
    if (!context) {
      console.error('Cant global.commit without `context`');
    }
    if (local) {
      const localPath = getLocalPath(path, context.state);
      return context.commit(localPath, data, { root: true });
    }

    return context.commit(path, data, { root: true });
  },
};
