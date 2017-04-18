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