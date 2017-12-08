'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var clone = _interopDefault(require('clone'));
var contextHmr = _interopDefault(require('webpack-context-vuex-hmr'));

/**
 * Finds a modules name by looking at its parent
 * @param  {object} state Vuex modules state
 * @return {String}       Module name
 */
function findModuleNameFromParent(state) {
  for (var prop in state.$parent) {
    if (state.$parent[prop] === state) {
      return prop;
    }
  }
}

function expandPath(self, path) {
  if (self['$vuex+']) {
    var instance = self.instance ? '$' + self.instance : '';
    if (self['$vuex+'].moduleName && self['$vuex+'].moduleName === self['$vuex+'].baseStoreName) {
      return self['$vuex+'].moduleName + instance + '/' + path;
    }

    var moduleName = self['$vuex+'].moduleName ? self['$vuex+'].moduleName + instance + '/' : '';
    return expandPath(self.$parent, moduleName + path);
  }

  return path;
}

/**
 * Combines info from ['vuex+'] property to root store name with instance
 * @param  {object} state Vuex modules state
 * @return {String}       Root store name
 */
function getRootStoreName(state) {
  var moduleName = state['vuex+'].storeName;
  if (state['vuex+'].rootInstance) {
    moduleName += '$' + state['vuex+'].rootInstance;
  }
  return moduleName;
}

/**
 * Traverses state upwards and returns the path with instances
 * @param  {Object} state     Vuex modules state
 * @param  {String} [path=''] Start path
 * @return {String}           The full path
 */
function findPath(state, path) {
  if ( path === void 0 ) path = '';

  if (state.$parent) {
    var moduleName = findModuleNameFromParent(state.$parent);
    if (moduleName) {
      moduleName += '/';
    } else {
      moduleName = '';
    }
    return findPath(state.$parent, moduleName + path);
  }
  return path;
}


/**
 * Input subpath and figure out full path
 * @param  {string} subpath The subpath to start from
 * @param  {Object} self    Vue component `.this`
 * @return {string}         Full path
 */
var getFullPath = function (subpath, self) {
  if (!subpath || subpath.indexOf('/') < 0) {
    console.error('[Vuex+]: Cant calculate path', subpath, 'for', self);
    return undefined;
  }

  if (subpath.slice(0, 6) === '$root/') {
    return subpath.replace(/^\$root/, self['$vuex+'].storeInstanceName);
  }

  var proposedModuleName = subpath.slice(0, subpath.indexOf('/'));
  var moduleName = self['$vuex+'].moduleName;
  if (!moduleName) {
    moduleName = proposedModuleName;
  }

  if (proposedModuleName !== moduleName) {
    console.error('[Vuex+]: Trying to find path', subpath, 'outside module ', moduleName);
    return undefined;
  }

  var instance = self.instance ? '$' + self.instance : '';
  var path = moduleName + instance + subpath.slice(subpath.indexOf('/'));

  if (moduleName !== self['$vuex+'].baseStoreName) {
    path = expandPath(self.$parent, path);
  }

  return path;
};

/**
 * Get store instance name
 * @param  {string} storeName Store name
 * @param  {string} instance  Instance name
 * @return {string}           Store instance name
 */
var getStoreInstanceName = function (storeName, instance) {
  if (instance) {
    return storeName + '$' + instance;
  }
  return storeName;
};

/**
 * Convert kebab and snake case to camelCase
 * @param  {string} str The string to Convert
 * @return {string}     Camel cased string
 */
var toCamelCase = function (str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/(-|_)([\w])/g, function (s) { return s[1].toUpperCase(); });
};

/**
 * Return the local path of the instance branch
 * @param  {string} path  The global path
 * @param  {Object} state The vuex context state
 * @return {string}       The local path with all instances
 */
var getLocalPath = function (path, state) {
  if (path.match(/^\$parent\//)) {
    path = path.replace('$parent/', findPath(state));
  }

  if (path.match(/^\$root\//)) {
    path = path.replace('$root', getRootStoreName(state));
  }

  if (path.includes('$parent')) {
    path = path.replace('$parent', findModuleNameFromParent(state.$parent));
  }

  return path;
};

/**
 * Returns subInstances from local path
 * @param  {string} path Path to explore
 * @return {array}       Subinstances as ordered array
 */

var vuexInstance = {};

var handlers = [];

/**
 * Returns all current vuex module handlers
 * @return {array} All current vuex module handlers
 */

/**
 * Clears the current vuex module handlers
 */


/**
 * Registers module for HMR
 * @param  {Object} newStore          The store object
 * @param  {string} baseStoreName     Base store name     - foo
 * @param  {string} storeInstanceName Store instance name - foo$bar
 */
var registerForHMR = function (newStore, baseStoreName, storeInstanceName) {
  handlers.push({
    storeName: baseStoreName + '-store',
    storeInstanceName: storeInstanceName,
    newStore: newStore,
  });
};

/**
 * Unregisters for HMR
 * @param  {Object} newStore The store object
 */
var unregisterForHMR = function (newStore) {
  handlers = handlers.filter(function (h) { return h.newStore !== newStore; });
};

/**
 * The hmr handler
 * @param  {array} updatedModules All the updated modules returned from HMR plugin
 */
var hmrHandler = function (updatedModules) {
  var modules = {};
  Object.keys(updatedModules).forEach(function (key) {
    var moduleLength = Object.keys(modules).length;
    var storeName = toCamelCase(key.replace(/-store$/, '')) + '-store';
    handlers
      .filter(function (handler) { return handler.storeName === storeName; })
      .forEach(function (handler) {
        modules[handler.storeInstanceName] = handler.newStore(updatedModules[key]);
      });

    if (moduleLength === Object.keys(modules).length) {
      modules[toCamelCase(key.replace(/-store$/, ''))] = updatedModules[key];
    }

    vuexInstance.store.hotUpdate({ modules: modules });
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
function createStore(storeInstanceName, instance, baseStoreName, store, parent) {
  var resultingStore = {
    namespaced: true,
  };

  Object.assign(resultingStore, store);
  resultingStore.state = {};
  if (store.state) {
    resultingStore.state = clone(store.state, false);
  }

  if (!parent) {
    parent = vuexInstance.store.state;
  }
  Object.defineProperty(resultingStore.state, '$parent', { get: function get() { return parent; } });

  resultingStore.state['vuex+'] = {};
  if (instance) {
    resultingStore.state['vuex+'].rootInstance = instance;
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
      resultingStore.modules[subInstanceName] = createStore(storeInstanceName, instance, baseStoreName, store.modules[subInstanceName], resultingStore.state); // eslint-disable-line
    });
  }

  return resultingStore;
}

var importer;
// Keep track of number of active instances
var activeInstances = {};

/**
 * Setup module with new importer from webpack-context-vuex-hmr
 * @param  {Object} newImporter The importer
 */
function setup(newImporter) {
  importer = newImporter;
}

/**
 * HMR Handler that returns new instance store on hmr
 * @param       {function} getNewInstanceStore Wrapped register with module information
 * @returns     {function} Function to make new instance
 */
function HmrHandler(getNewInstanceStore) {
  return function (newLoadedModule) { return getNewInstanceStore(newLoadedModule); };
}

/**
 * Add a new store instance
 * The Vue component gets two props:
 * - instance {string}: Contains the instance name
 * - preserve {boolean}: If true, the store wont be discarded when the final instance is destroyed
 * @param {string} baseStoreName - The base store name, same as the store filename
 * @returns {mixin, api} api for the loaded module and a mixin
 */
function register$1(baseStoreName) {
  var loadedModule = importer.getModules()[baseStoreName];

  return {
    props: ['instance', 'preserve'],
    created: function created() {
      var this$1 = this;

      baseStoreName = toCamelCase(baseStoreName.replace(/-store$/, ''));
      this['$vuex+'] = {
        baseStoreName: baseStoreName,
        moduleName: baseStoreName,
        storeInstanceName: getStoreInstanceName(baseStoreName, this.instance),
      };
      activeInstances[this['$vuex+'].storeInstanceName] = activeInstances[this['$vuex+'].storeInstanceName] || 0;
      activeInstances[this['$vuex+'].storeInstanceName]++;

      var getNewInstanceStore = function (newLoadedModule) { return createStore(this$1['$vuex+'].storeInstanceName, this$1.instance,
        baseStoreName, newLoadedModule); };

      var store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this['$vuex+'].storeInstanceName]) { // eslint-disable-line
        this.$store.registerModule(this['$vuex+'].storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(getNewInstanceStore);
          registerForHMR(this.$hmrHandler, baseStoreName, this['$vuex+'].storeInstanceName);
        }
      }
    },

    destroyed: function destroyed() {
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

/**
 * Setup vuex plus with the base vuex store
 * @param  {Object} $store Base vuex store
 */
function setupVuexPlus($store) {
  vuexInstance.store = $store;
  var importer = contextHmr.getNewInstance();
  setup(importer);
  var modules = importer.getModules();
  // Add normal vuex modules
  Object.keys(modules).forEach(function (moduleName) {
    var baseStoreName = toCamelCase(moduleName.replace(/-store$/, ''));
    if (!modules[moduleName].state || (modules[moduleName].state && !modules[moduleName].state['vuex+'])) {
      $store.registerModule(baseStoreName, modules[moduleName]);
    }
  });
  importer.setupHMR(hmrHandler);
}

var generateMappingFunction = function (method, mappingVuexPaths) {
  var result = {};
  var pathKey = Object.keys(mappingVuexPaths)[0];
  var moduleName = '';
  if (pathKey) {
    if (!mappingVuexPaths[pathKey].toString().includes('/')) {
      console.error('[Vuex+] Vuex path not namespaced in mapping function! Got:\n' + JSON.stringify(mappingVuexPaths, undefined, 2));
      return undefined;
    }
    var vuexPath = mappingVuexPaths[pathKey];
    moduleName = vuexPath.slice(0, mappingVuexPaths[pathKey].indexOf('/'));
  }

  Object.keys(mappingVuexPaths).forEach(function (key) {
    result[key] = function map(payload) {
      if (!this['$vuex+'].moduleName && moduleName) {
        this['$vuex+'].moduleName = this['$vuex+'].moduleName || moduleName;
      }
      var path = getFullPath(mappingVuexPaths[key], this);
      if (method === 'getters') {
        result[key].vuex = true; // Mark getter for devtools
        return this.$store[method][path];
      }
      return this.$store[method](path, payload);
    };
  });

  return result;
};

var _map = {
  /**
   * Map local paths `require('./example-substore.js').api.get.value`
   * to the corresponding vuex getter.
   * @param {Object} map - Object of all computed properties to be mapped to getters
   * @returns {Object} - Object containing the mapped getters
   */
  getters: function getters(mappingVuexPaths) {
    return generateMappingFunction('getters', mappingVuexPaths);
  },

  /**
   * Map local paths `require('./example-substore.js').api.act.value`
   * to the corresponding vuex action.
   * @param {Object} map - Object of all method properties to be mapped to actions
   * @returns {Object} - Object containing the mapped actions
   */
  actions: function actions(mappingVuexPaths) {
    return generateMappingFunction('dispatch', mappingVuexPaths);
  },
};

var _root = {
  /**
   * Method that returns a getter.
   * Only set `state` when getting from same instance
   * @param {string} path - Path as as string, usually from api. Eg. `api.example.get.something`
   * @param {Object} state - Optional local vuex state. Set it when searching in same instance.
   * @returns {any} - Value from Vuex getter
   */
  get: function get(ref) {
    var path = ref.path;
    var state = ref.state;
    var vnode = ref.vnode;

    if (state) {
      var localPath = getLocalPath(path, state);
      return vuexInstance.store.getters[localPath];
    }

    if (vnode) {
      var localPath$1 = path.replace(/^\$root/, vnode['$vuex+'].storeInstanceName);
      return vuexInstance.store.getters[localPath$1];
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
  dispatch: function dispatch(ref) {
    var path = ref.path;
    var data = ref.data;
    var state = ref.state;
    var vnode = ref.vnode;

    if (state) {
      var localPath = getLocalPath(path, state);
      return vuexInstance.store.dispatch(localPath, data);
    }

    if (vnode) {
      var localPath$1 = path.replace(/^\$root/, vnode['$vuex+'].storeInstanceName);
      return vuexInstance.store.dispatch(localPath$1, data);
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
  commit: function commit(ref) {
    var path = ref.path;
    var data = ref.data;
    var state = ref.state;
    var vnode = ref.vnode;

    if (state) {
      var localPath = getLocalPath(path, state);
      return vuexInstance.store.commit(localPath, data);
    }

    if (vnode) {
      var localPath$1 = path.replace(/^\$root/, vnode['$vuex+'].storeInstanceName);
      return vuexInstance.store.commit(localPath$1, data);
    }

    return vuexInstance.store.commit(path, data);
  },
};

var _vuePluginInstall = {
  /**
   * Use to install as Vue plugin
   * @param  {Object} Vue The vue instance
   */
  install: function install(Vue) {
    Vue.mixin({
      props: ['instance'],
      beforeCreate: function beforeCreate() {
        var this$1 = this;

        var findModuleName = function (parent) {
          if (!this$1['$vuex+'] && parent.$parent) {
            if (!parent.$parent['$vuex+']) {
              findModuleName(parent.$parent);
            } else {
              this$1['$vuex+'] = {
                baseStoreName: parent.$parent['$vuex+'].baseStoreName,
                storeInstanceName: parent.$parent['$vuex+'].storeInstanceName,
              };
            }
          }
        };

        findModuleName(this);
      },
    });
  },
};

var map = _map;
var store = function (s) {
  s.namespaced = true;
  s.state = s.state || {};
  s.state['vuex+'] = {};
  return s;
};
var newInstance = clone;
var root = _root;
var register = register$1;
var hmrCallback = hmrHandler;

var vuex_ = {
  getVuePlugin: function getVuePlugin(Vue) { // eslint-disable-line
    return _vuePluginInstall;
  },
  getVuexPlugin: function getVuexPlugin(Vuex) {
    // Add $parent to all vuex models states
    function setParents(parent) {
      Object.keys(parent).forEach(function (prop) {
        if (prop !== 'vuex+' && typeof parent[prop] === 'object' && parent[prop]['vuex+']) {
          setParents(parent[prop]);
          Object.defineProperty(parent[prop], '$parent', { get: function get() { return parent; } });
        }
      });
    }

    // Patch replaceState to set $parent to all states on updates state
    var org = Vuex.Store.prototype.replaceState;
    Vuex.Store.prototype.replaceState = function replacestate(newState) {
      setParents(newState);
      org.call(this, newState);
    };

    return setupVuexPlus;
  },
};

exports.map = map;
exports.store = store;
exports.newInstance = newInstance;
exports.root = root;
exports.register = register;
exports.hmrCallback = hmrCallback;
exports['default'] = vuex_;
