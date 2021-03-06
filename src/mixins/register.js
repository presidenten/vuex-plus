import createStore from './createStore.js';
import { getStoreInstanceName, toCamelCase } from '../common/helpers.js';
import { registerForHMR, unregisterForHMR } from '../common/hmrHandler.js';

let importer;
// Keep track of number of active instances
const activeInstances = {};

/**
 * Setup module with new importer from webpack-context-vuex-hmr
 * @param  {Object} newImporter The importer
 */
export function setup(newImporter) {
  importer = newImporter;
}

/**
 * HMR Handler that returns new instance store on hmr
 * @param       {function} getNewInstanceStore Wrapped register with module information
 * @returns     {function} Function to make new instance
 */
export function HmrHandler(getNewInstanceStore) {
  return newLoadedModule => getNewInstanceStore(newLoadedModule);
}

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as the store filename
 * @returns {mixin, api} api for the loaded module and a mixin
 */
export default function register(baseStoreName) {
  const loadedModule = importer.getModules()[baseStoreName];

  return {
    props: ['instance', 'preserve'],
    beforeCreate() {
      baseStoreName = toCamelCase(baseStoreName.replace(/-store$/, ''));
      this['$vuex+'] = {
        baseStoreName,
        moduleName: baseStoreName,
        storeInstanceName: getStoreInstanceName(baseStoreName, this.$options.propsData.instance),
      };
      activeInstances[this['$vuex+'].storeInstanceName] = activeInstances[this['$vuex+'].storeInstanceName] || 0;
      activeInstances[this['$vuex+'].storeInstanceName]++;

      const getNewInstanceStore = newLoadedModule => createStore(this['$vuex+'].storeInstanceName, this.$options.propsData.instance,
        baseStoreName, newLoadedModule);

      const store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this['$vuex+'].storeInstanceName]) { // eslint-disable-line
        this.$store.registerModule(this['$vuex+'].storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(getNewInstanceStore);
          registerForHMR(this.$hmrHandler, baseStoreName, this['$vuex+'].storeInstanceName);
        }
      }
    },

    destroyed() {
      activeInstances[this['$vuex+'].storeInstanceName]--;

      if (!this.preserve && activeInstances[this['$vuex+'].storeInstanceName] === 0) {
        this.$store.unregisterModule(this['$vuex+'].storeInstanceName);

        if (module.hot) {
          unregisterForHMR(this.$hmrHandler);
        }
      }
    },
  };
}
