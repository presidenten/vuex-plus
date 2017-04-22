'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hmrHandler = exports.unregisterForHMR = exports.registerForHMR = exports.setStore = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _helpers = require('./helpers.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handlers = [];
var store = void 0;
var setStore = exports.setStore = function setStore(vuexStore) {
  store = vuexStore;
};

var registerForHMR = exports.registerForHMR = function registerForHMR(newStore, baseStoreName, storeInstanceName) {
  handlers.push({
    storeName: baseStoreName + '-store',
    storeInstanceName: storeInstanceName,
    newStore: newStore
  });
};

var unregisterForHMR = exports.unregisterForHMR = function unregisterForHMR(newStore) {
  handlers = handlers.filter(function (h) {
    return h.newStore !== newStore;
  });
};

var hmrHandler = exports.hmrHandler = function hmrHandler(updatedModules) {
  var modules = {};
  (0, _keys2.default)(updatedModules).forEach(function (key) {
    var storeName = (0, _helpers.toCamelCase)(key.replace('-store', '')) + '-store';
    handlers.filter(function (handler) {
      return handler.storeName === storeName;
    }).forEach(function (handler) {
      modules[handler.storeInstanceName] = handler.newStore(updatedModules[key]);
    });
    store.hotUpdate({ modules: modules });
  });
};