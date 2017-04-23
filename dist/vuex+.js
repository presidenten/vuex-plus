import contextHmr from 'webpack-context-vuex-hmr';
import clone from 'clone';

var getStoreInstanceName = function (storeName, instance) {
  if (instance) {
    return storeName + '#' + instance;
  }
  return storeName;
};

var toCamelCase = function (str) { return str.replace(/(-|_)([a-z])/g, function (s) { return s[1].toUpperCase(); }); };

var getLocalPath = function (path, context) {
  var storeName = context.state['vuex+'].storeName;
  var instance = context.state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};

/**
 * Private method that modifies magics strings to contain their parents
 */
function addModuleToNames(name, subapi) {
  var result = {};
  Object.keys(subapi).forEach(function (type) {
    if (type === 'get' || type === 'act' || type === 'mutate') {
      result[type] = {};
      Object.keys(subapi[type]).forEach(function (pathName) {
        var path = subapi[type][pathName];
        result[type][pathName] = name + '/' + path;
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
var storeWrapper = function (store) {
  store.api = {};
  store.namespaced = true;

  var camelCasedName = toCamelCase(store.name);

  // Clone getters
  if (store.getters) {
    store.api.get = {};
    Object.keys(store.getters).forEach(function (name) {
      store.api.get[name] = camelCasedName + '/' + name;
    });
  }

  // Clone actions
  if (store.actions) {
    store.api.act = {};
    Object.keys(store.actions).forEach(function (name) {
      store.api.act[name] = camelCasedName + '/' + name;
    });
  }

  // Clone mutations
  if (store.mutations) {
    store.api.mutate = {};
    Object.keys(store.mutations).forEach(function (name) {
      store.api.mutate[name] = camelCasedName + '/' + name;
    });
  }

  // Clone modules
  if (store.modules) {
    Object.keys(store.modules).forEach(function (name) {
      store.api[name] = addModuleToNames(camelCasedName, store.modules[name].api);
    });
  }

  return store;
};

/**
 * Methods to replace normal Vuex mapGetters & mapActions.
 * These mapping functions use the vuex+ global store api like so:
 * ```
 * computed: {
 *   ...mapGetters({
 *     something: api.example.get.something,
 *   }),
 * },
 * methods: {
 *   ...mapActions({
 *     doSomething: api.example.act.doSomething,
 *   }),
 * },
 * ```
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @returns {Object} { mapGetters, mapActions }
 */
var generateMappingFunction = function (baseStoreName) {
  return {
    mapGetters: function mapGetters(map) {
      var result = {};
      Object.keys(map).forEach(function (key) {
        result[key] = function get() {
          return this.$store.getters[map[key].replace(baseStoreName, this.storeInstanceName)];
        };
      });
      return result;
    },

    mapActions: function mapActions(map) {
      var result = {};
      Object.keys(map).forEach(function (key) {
        result[key] = function dispatch(payload) {
          return this.$store.dispatch(map[key].replace(baseStoreName, this.storeInstanceName),
                                      payload);
        };
      });
      return result;
    },

  };
};

/**
 * Create new namespaced store instance
 * @param {string} storeInstanceName - The full instance name
 * @param {string} instance - Instance name, same as in `instance="my-counter"`
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @param {Object} store - The base store name, same as in `store({ name })`
 * @returns {Object} Vuex module store with submodules
 */
function newStore(storeInstanceName, instance, baseStoreName, store) {
  var resultingStore = {
    namespaced: true,
  };

  Object.assign(resultingStore, store);
  resultingStore.state = {};
  if (store.state) {
    resultingStore.state = clone(store.state, false);
  }
  resultingStore.state['vuex+'] = {};
  if (instance) {
    resultingStore.state['vuex+'].instance = instance;
  }
  resultingStore.state['vuex+'].storeName = baseStoreName;
  ['actions', 'getters', 'mutations'].forEach(function (type) {
    if (store[type]) {
      resultingStore[type] = {};
      Object.keys(store[type]).forEach(function (name) {
        var newName = name.replace(baseStoreName, storeInstanceName);
        resultingStore[type][newName] = store[type][name];
      });
    }
  });
  if (resultingStore.modules) {
    resultingStore.modules = {};
    Object.keys(store.modules).forEach(function (subInstanceName) {
      resultingStore.modules[subInstanceName] = newStore(storeInstanceName, instance, baseStoreName, store.modules[subInstanceName]); // eslint-disable-line
    });
  }

  return resultingStore;
}

var handlers = [];
var store$1;
var setStore = function (vuexStore) {
  store$1 = vuexStore;
};

var registerForHMR = function (newStore, baseStoreName, storeInstanceName) {
  handlers.push({
    storeName: baseStoreName + '-store',
    storeInstanceName: storeInstanceName,
    newStore: newStore,
  });
};

var unregisterForHMR = function (newStore) {
  handlers = handlers.filter(function (h) { return h.newStore !== newStore; });
};

var hmrHandler = function (updatedModules) {
  var modules = {};
  Object.keys(updatedModules).forEach(function (key) {
    var storeName = toCamelCase(key.replace('-store', '')) + '-store';
    handlers
      .filter(function (handler) { return handler.storeName === storeName; })
      .forEach(function (handler) {
        modules[handler.storeInstanceName] = handler.newStore(updatedModules[key]);
      });
    store$1.hotUpdate({ modules: modules });
  });
};

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @param {Object} loadedModule - The loaded javascript module containing the Vuex module store
 * @returns {Object} Vue module mixin
 */
var generateAddStore = function (baseStoreName, loadedModule) {
  var counter = {};
  function HmrHandler(instanceName, getNewInstanceStore) {
    return function (newLoadedModule) { return getNewInstanceStore(newLoadedModule); };
  }

  return {
    props: ['instance', 'preserve'],
    created: function created() {
      var this$1 = this;

      this.storeInstanceName = getStoreInstanceName(baseStoreName, this.instance);

      counter[this.storeInstanceName] = counter[this.storeInstanceName] || 0;
      counter[this.storeInstanceName]++;

      var getNewInstanceStore = function (newLoadedModule) { return newStore(this$1.storeInstanceName, this$1.instance,
                                                              baseStoreName, newLoadedModule); };

      var store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this.storeInstanceName]) { // eslint-disable-line
        this.$store.registerModule(this.storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(this.storeInstanceName, getNewInstanceStore);
          registerForHMR(this.$hmrHandler, baseStoreName, this.storeInstanceName);
        }
      }
    },

    destroyed: function destroyed() {
      counter[this.storeInstanceName]--;

      if (!this.preserve && counter[this.storeInstanceName] === 0) {
        this.$store.unregisterModule(this.storeInstanceName);

        if (module.hot) {
          unregisterForHMR(this.$hmrHandler);
        }
      }
    },
  };
};

function ModuleLoadException(storeInstanceName) {
  this.message = 'No parent with store instance name ' + storeInstanceName + ' found';
  this.name = 'ModuleLoadException';
}

/**
 * Use a store instance.
 * Usually used by submodules to specify that they are in the same instance as their parent
 * @returns {Object} Vue module mixin
 */
var useStore = {
  created: function created() {
    var this$1 = this;

    var findModuleName = function (parent) {
      if (parent.$parent) {
        if (!parent.$parent.storeInstanceName) {
          findModuleName(parent.$parent);
        } else {
          this$1.storeInstanceName = parent.$parent.storeInstanceName;
        }
      } else {
        throw new ModuleLoadException(this$1.storeInstanceName);
      }
    };

    findModuleName(this);
  },
};

var importer;

/**
 * The api for all stores
 * The api is autogenerated once the module importer has been set
 * ```
 *   api.aStore.get.something => vuex magic string for vuex getter
 * ```
 */
var api$1 = {};

/**
 * Set the importer that can read all stores via require.context
 */
var setup = function (newImporter) {
  importer = newImporter;

  var modules = importer.getModules();
  Object.keys(modules).forEach(function (module) {
    var camelCasedName = toCamelCase(modules[module].name);
    api$1[camelCasedName] = modules[module].api;
  });
};

function ModuleNotFoundException(baseStoreName) {
  this.message = 'Module [' + baseStoreName + '] could not be loaded.';
  this.name = 'ModuleNotFoundException';
}

/**
 * Generate new component instance and return a mixin as well as functions
 * to map getters and actions to computed and methods.
 */
var use$1 = function use(baseStoreName) {
  var loadedModule = importer.getModules()[baseStoreName];
  if (!loadedModule) {
    throw new ModuleNotFoundException(baseStoreName);
  }

  baseStoreName = toCamelCase(baseStoreName.replace(/-store$/, ''));

  var ref = generateMappingFunction(baseStoreName);
  var mapActions = ref.mapActions;
  var mapGetters = ref.mapGetters;
  var addStore = generateAddStore(baseStoreName, loadedModule, importer);

  return {
    mapActions: mapActions,
    mapGetters: mapGetters,
    mixins: {
      addStore: addStore,
      useStore: useStore,
    },
  };
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
var store = storeWrapper;

var hmrCallback = hmrHandler;

/**
 * Global api with magical strings to all root modules
 * @returns {Object} - Object with magical strings
 */
var api$$1 = api$1;

/**
 * Method that defines which Vuex module store to use
 * @param {string} - Instance name as string, `example-sto
 * @returns {Object} - `{ mapActions, mapActions, mixins }` where `mixins`
 *                      contains `addStore` and `useStore`.
 */
var use$$1 = use$1;

/**
 * Method that returns a getter from the same instance.
 * @param {string} - Path as as string, usually from api. Eg. `api.example.get.something`
 * @param {Context} - Vuex context
 * @returns {any} - Value from Vuex getter
 */
var instance = {
  get: function get(ref) {
    var path = ref.path;
    var context = ref.context;

    var localPath = getLocalPath(path, context);

    return context.rootGetters[localPath];
  },

  dispatch: function dispatch(ref) {
    var path = ref.path;
    var data = ref.data;
    var context = ref.context;

    var localPath = getLocalPath(path, context);

    return context.dispatch(localPath, data, { root: true });
  },

  commit: function commit(ref) {
    var path = ref.path;
    var data = ref.data;
    var context = ref.context;

    var localPath = getLocalPath(path, context);

    return context.commit(localPath, data, { root: true });
  },
};

var setupDone = false;
var vuex_ = {
  install: function install(Vue) {
    Vue.mixin({
      created: function created() {
        var this$1 = this;

        if (!setupDone && this.$store) {
          setStore(this.$store);
          var importer = contextHmr.getNewInstance();
          setup(importer);
          importer.getModules();
          importer.setupHMR(hmrHandler);
          setupDone = true;
        }

        var findModuleName = function (parent) {
          if (!this$1.storeInstanceName && parent.$parent) {
            if (!parent.$parent.storeInstanceName) {
              findModuleName(parent.$parent);
            } else {
              this$1.storeInstanceName = parent.$parent.storeInstanceName;
            }
          }
        };

        findModuleName(this);
      },
    });
  },
};

export { store, hmrCallback, api$$1 as api, use$$1 as use, instance };export default vuex_;
