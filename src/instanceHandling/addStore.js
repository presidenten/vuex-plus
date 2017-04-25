import newStore from './newStore.js';
import { getStoreInstanceName, toCamelCase } from './helpers.js';
import { registerForHMR, unregisterForHMR } from './hmrHandler.js';

let importer;

export function setup(newImporter) {
  importer = newImporter;
}

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as the store filename
 * @param {Object} loadedModule - The loaded javascript module containing the Vuex module store
 * @returns {mixin, api} api for the loaded module and a mixin
 */
export function add(baseStoreName) {
  const loadedModule = importer.getModules()[baseStoreName];
  const counter = {};
  function HmrHandler(instanceName, getNewInstanceStore) {
    return newLoadedModule => getNewInstanceStore(newLoadedModule);
  }

  return {
    api: loadedModule.api,
    mixin: {
      props: ['instance', 'preserve'],
      created() {
        baseStoreName = toCamelCase(baseStoreName.replace(/-store$/, ''));
        this['$vuex+'] = {
          baseStoreName,
          storeInstanceName: getStoreInstanceName(baseStoreName, this.instance),
        };

        counter[this['$vuex+'].storeInstanceName] = counter[this['$vuex+'].storeInstanceName] || 0;
        counter[this['$vuex+'].storeInstanceName]++;

        const getNewInstanceStore = newLoadedModule => newStore(this['$vuex+'].storeInstanceName, this.instance,
                                                                baseStoreName, newLoadedModule);

        const store = getNewInstanceStore(loadedModule);
        if (!this.$store._modules.root._children[this['$vuex+'].storeInstanceName]) { // eslint-disable-line
          this.$store.registerModule(this['$vuex+'].storeInstanceName, store);

          if (module.hot) {
            this.$hmrHandler = new HmrHandler(this['$vuex+'].storeInstanceName, getNewInstanceStore);
            registerForHMR(this.$hmrHandler, baseStoreName, this['$vuex+'].storeInstanceName);
          }
        }
      },

      destroyed() {
        counter[this['$vuex+'].storeInstanceName]--;

        if (!this.preserve && counter[this['$vuex+'].storeInstanceName] === 0) {
          this.$store.unregisterModule(this['$vuex+'].storeInstanceName);

          if (module.hot) {
            unregisterForHMR(this.$hmrHandler);
          }
        }
      },
    },
  };
}
