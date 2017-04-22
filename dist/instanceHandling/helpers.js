'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getStoreInstanceName = exports.getStoreInstanceName = function getStoreInstanceName(storeName, instance) {
  if (instance) {
    return storeName + '#' + instance;
  }
  return storeName;
};

var toCamelCase = exports.toCamelCase = function toCamelCase(str) {
  return str.replace(/(-|_)([a-z])/g, function (s) {
    return s[1].toUpperCase();
  });
};

var getLocalPath = exports.getLocalPath = function getLocalPath(path, context) {
  var storeName = context.state['vuex+'].storeName;
  var instance = context.state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};