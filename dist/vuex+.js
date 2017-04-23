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

var importer;

function setup(newImporter) {
  importer = newImporter;
}

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as the store filename
 * @param {Object} loadedModule - The loaded javascript module containing the Vuex module store
 * @returns {Object} Vue module mixin
 */
function add(baseStoreName) {
  var loadedModule = importer.getModules()[baseStoreName];
  var counter = {};
  function HmrHandler(instanceName, getNewInstanceStore) {
    return function (newLoadedModule) { return getNewInstanceStore(newLoadedModule); };
  }

  return {
    props: ['instance', 'preserve'],
    created: function created() {
      var this$1 = this;

      baseStoreName = toCamelCase(baseStoreName.replace(/-store$/, ''));
      this['$vuex+'] = {
        baseStoreName: baseStoreName,
        storeInstanceName: getStoreInstanceName(baseStoreName, this.instance),
      };

      counter[this['$vuex+'].storeInstanceName] = counter[this['$vuex+'].storeInstanceName] || 0;
      counter[this['$vuex+'].storeInstanceName]++;

      var getNewInstanceStore = function (newLoadedModule) { return newStore(this$1['$vuex+'].storeInstanceName, this$1.instance,
                                                              baseStoreName, newLoadedModule); };

      var store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this['$vuex+'].storeInstanceName]) { // eslint-disable-line
        this.$store.registerModule(this['$vuex+'].storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(this['$vuex+'].storeInstanceName, getNewInstanceStore);
          registerForHMR(this.$hmrHandler, baseStoreName, this['$vuex+'].storeInstanceName);
        }
      }
    },

    destroyed: function destroyed() {
      counter[this['$vuex+'].storeInstanceName]--;

      if (!this.preserve && counter[this['$vuex+'].storeInstanceName] === 0) {
        this.$store.unregisterModule(this['$vuex+'].storeInstanceName);

        if (module.hot) {
          unregisterForHMR(this.$hmrHandler);
        }
      }
    },
  };
}

var importer$1;

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
var generateAPI = function (newImporter) {
  importer$1 = newImporter;

  var modules = importer$1.getModules();
  Object.keys(modules).forEach(function (module) {
    var camelCasedName = toCamelCase(modules[module].name);
    api$1[camelCasedName] = modules[module].api;
  });
};

var addStore = add;

function searchDeeper(map, key) {
  var submodules = Object.keys(map).filter(function (k) { return k !== 'get' && k !== 'act' && k !== 'mutate'; });
  var keyIsInMap = submodules.indexOf(key) >= 0;

  if (keyIsInMap) {
    return map[key];
  }

  // TODO Speed up with some nice algorithm
  var result;
  submodules.forEach(function (submodule) {
    var searchResult = searchDeeper(map[submodule], key);
    if (searchResult) {
      result = searchResult;
    }
  });

  return result;
}

var map = {
  getters: function getters(m) {
    var result = {};
    Object.keys(m).forEach(function (key) {
      result[key] = function get() {
        var getterKey = m[key].match(/[a-zA-Z]*/)[0];

        var localApi = api$1[this['$vuex+'].baseStoreName];
        if (getterKey !== this['$vuex+'].baseStoreName) {
          localApi = searchDeeper(api$1[this['$vuex+'].baseStoreName], getterKey);
        }
        return this.$store.getters[localApi.get[key].replace(this['$vuex+'].baseStoreName, this['$vuex+'].storeInstanceName)];
      };
    });
    return result;
  },

  actions: function actions(m) {
    var result = {};
    Object.keys(m).forEach(function (key) {
      result[key] = function dispatch(payload) {
        var actionKey = m[key].match(/[a-zA-Z]*/)[0];

        var localApi = api$1[this['$vuex+'].baseStoreName];
        if (actionKey !== this['$vuex+'].baseStoreName) {
          localApi = searchDeeper(api$1[this['$vuex+'].baseStoreName], actionKey);
        }
        return this.$store.dispatch(localApi.act[key].replace(this['$vuex+'].baseStoreName, this['$vuex+'].storeInstanceName), payload);
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
var store = storeWrapper;

var hmrCallback = hmrHandler;

/**
 * Global api with magical strings to all root modules
 * @returns {Object} - Object with magical strings
 */
var api$$1 = api$1;

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
          generateAPI(importer);
          setup(importer);
          importer.getModules();
          importer.setupHMR(hmrHandler);
          setupDone = true;
        }

        var findModuleName = function (parent) {
          if (!this$1['$vuex+'] && parent.$parent) {
            // console.info(parent.$parent.name, parent.$parent);
            if (!parent.$parent['$vuex+']) {
              findModuleName(parent.$parent, '/');
            } else {
              // console.info('found [vuex+]', parent.$parent['$vuex+'].baseStoreName);
              this$1['$vuex+'] = {
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

export { addStore, map, store, hmrCallback, api$$1 as api, instance };export default vuex_;
