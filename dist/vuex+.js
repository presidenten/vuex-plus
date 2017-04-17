'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instance = exports.use = exports.api = exports.hmrCallback = exports.setup = exports.store = undefined;

var _storeWrapper = require('./instanceHandling/storeWrapper.js');

var _storeWrapper2 = _interopRequireDefault(_storeWrapper);

var _use = require('./instanceHandling/use.js');

var instanceHandler = _interopRequireWildcard(_use);

var _hmrHandler = require('./instanceHandling/hmrHandler.js');

var _helpers = require('./instanceHandling/helpers.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = exports.store = _storeWrapper2.default;

var setup = exports.setup = function setup(importer, vuexStore) {
  instanceHandler.setup(importer);
  (0, _hmrHandler.setStore)(vuexStore);
};

var hmrCallback = exports.hmrCallback = _hmrHandler.hmrHandler;

var api = exports.api = instanceHandler.api;

var use = exports.use = instanceHandler.use;

function getLocalPath(path, context) {
  var storeName = context.state['vuex+'].storeName;
  var instance = context.state['vuex+'].instance;
  return path.replace(storeName, (0, _helpers.getStoreInstanceName)(storeName, instance));
}
var instance = exports.instance = {
  get: function get(_ref) {
    var path = _ref.path,
        context = _ref.context;

    var localPath = getLocalPath(path, context);

    return context.rootGetters[localPath];
  },
  dispatch: function dispatch(_ref2) {
    var path = _ref2.path,
        data = _ref2.data,
        context = _ref2.context;

    var localPath = getLocalPath(path, context);

    return context.dispatch(localPath, data, { root: true });
  },
  commit: function commit(_ref3) {
    var path = _ref3.path,
        data = _ref3.data,
        context = _ref3.context;

    var localPath = getLocalPath(path, context);

    return context.commit(localPath, data, { root: true });
  }
};