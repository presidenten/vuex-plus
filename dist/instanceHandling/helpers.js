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