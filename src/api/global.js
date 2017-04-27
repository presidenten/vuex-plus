import clone from 'clone';
import { api } from './api.js';
import { getStoreInstanceName } from '../common/helpers.js';

const getLocalPath = (path, context) => {
  const storeName = context.state['vuex+'].storeName;
  const instance = context.state['vuex+'].instance;
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

  get({ path, context, local }) {
    if (local) {
      const localPath = getLocalPath(path, context);
      return context.rootGetters[localPath];
    }

    return context.rootGetters[path];
  },

  dispatch({ path, data, context, local }) {
    if (local) {
      const localPath = getLocalPath(path, context);
      return context.dispatch(localPath, data, { root: true });
    }

    return context.dispatch(path, data, { root: true });
  },

  commit({ path, data, context, local }) {
    if (local) {
      const localPath = getLocalPath(path, context);
      return context.commit(localPath, data, { root: true });
    }

    return context.commit(path, data, { root: true });
  },
};
