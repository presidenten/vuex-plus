'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.use = exports.setup = exports.api = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _mappingFunctions = require('./mappingFunctions.js');

var _mappingFunctions2 = _interopRequireDefault(_mappingFunctions);

var _addStore = require('../mixins/addStore.js');

var _addStore2 = _interopRequireDefault(_addStore);

var _useStore = require('../mixins/useStore.js');

var _useStore2 = _interopRequireDefault(_useStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var importer = void 0;
var toCamelCase = function toCamelCase(str) {
  return str.replace(/(-|_)([a-z])/g, function (s) {
    return s[1].toUpperCase();
  });
};

var api = exports.api = {};

var setup = exports.setup = function setup(newImporter) {
  importer = newImporter;

  var modules = importer.getModules();
  (0, _keys2.default)(modules).forEach(function (module) {
    var camelCasedName = toCamelCase(modules[module].name);
    api[camelCasedName] = modules[module].api;
  });
};

function ModuleNotFoundException(baseStoreName) {
  this.message = 'Module [' + baseStoreName + '] could not be loaded.';
  this.name = 'ModuleNotFoundException';
}

var use = exports.use = function use(baseStoreName) {
  var loadedModule = importer.getModules()[baseStoreName];
  if (!loadedModule) {
    throw new ModuleNotFoundException(baseStoreName);
  }

  baseStoreName = baseStoreName.replace(/-store$/, '');

  var _generateMappingFunct = (0, _mappingFunctions2.default)(baseStoreName),
      mapActions = _generateMappingFunct.mapActions,
      mapGetters = _generateMappingFunct.mapGetters;

  var addStore = (0, _addStore2.default)(baseStoreName, loadedModule, importer);

  return {
    mapActions: mapActions,
    mapGetters: mapGetters,
    mixins: {
      addStore: addStore,
      useStore: _useStore2.default
    }
  };
};