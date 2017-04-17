import newStore from '../instanceHandling/newStore.js';
import { getStoreInstanceName } from '../instanceHandling/helpers.js';
import { registerForHMR, unregisterForHMR } from '../instanceHandling/hmrHandler.js';

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @param {Object} loadedModule - The loaded javascript module containing the Vuex module store
 * @returns {Object} Vue module mixin
 */
export default function (baseStoreName, loadedModule) {
  const counter = {};
  function HmrHandler(instanceName, getNewInstanceStore) {
    return newLoadedModule => getNewInstanceStore(newLoadedModule);
  }

  return {
    props: ['instance', 'preserve'],
    created() {
      this.storeInstanceName = getStoreInstanceName(baseStoreName, this.instance);

      counter[this.storeInstanceName] = counter[this.storeInstanceName] || 0;
      counter[this.storeInstanceName]++;

      const getNewInstanceStore = newLoadedModule => newStore(this.storeInstanceName, this.instance,
                                                              baseStoreName, newLoadedModule);

      const store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this.storeInstanceName]) { // eslint-disable-line
        this.$store.registerModule(this.storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(this.storeInstanceName, getNewInstanceStore);
          registerForHMR(this.$hmrHandler, baseStoreName, this.storeInstanceName);
        }
      }
    },

    destroyed() {
      counter[this.storeInstanceName]--;

      if (!this.preserve && counter[this.storeInstanceName] === 0) {
        this.$store.unregisterModule(this.storeInstanceName);

        if (module.hot) {
          unregisterForHMR(this.$hmrHandler);
        }
      }
    },
  };
}
