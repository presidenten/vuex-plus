'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = newStore;

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newStore(storeInstanceName, instance, baseStoreName, store) {
  var resultingStore = {
    namespaced: true
  };

  (0, _assign2.default)(resultingStore, store);
  resultingStore.state = {};
  if (store.state) {
    resultingStore.state = (0, _clone2.default)(store.state, false);
  }
  resultingStore.state['vuex+'] = {};
  if (instance) {
    resultingStore.state['vuex+'].instance = instance;
  }
  resultingStore.state['vuex+'].storeName = baseStoreName;
  ['actions', 'getters', 'mutations'].forEach(function (type) {
    if (store[type]) {
      resultingStore[type] = {};
      (0, _keys2.default)(store[type]).forEach(function (name) {
        var newName = name.replace(baseStoreName, storeInstanceName);
        resultingStore[type][newName] = store[type][name];
      });
    }
  });
  if (resultingStore.modules) {
    resultingStore.modules = {};
    (0, _keys2.default)(store.modules).forEach(function (subInstanceName) {
      resultingStore.modules[subInstanceName] = newStore(storeInstanceName, instance, baseStoreName, store.modules[subInstanceName]);
    });
  }

  return resultingStore;
}