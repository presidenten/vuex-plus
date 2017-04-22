'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.instance = exports.use = exports.api = exports.hmrCallback = exports.store = undefined;

var _webpackContextVuexHmr = require('webpack-context-vuex-hmr');

var _webpackContextVuexHmr2 = _interopRequireDefault(_webpackContextVuexHmr);

var _storeWrapper = require('./instanceHandling/storeWrapper.js');

var _storeWrapper2 = _interopRequireDefault(_storeWrapper);

var _use = require('./instanceHandling/use.js');

var instanceHandler = _interopRequireWildcard(_use);

var _hmrHandler = require('./instanceHandling/hmrHandler.js');

var _helpers = require('./instanceHandling/helpers.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = exports.store = _storeWrapper2.default;

var hmrCallback = exports.hmrCallback = _hmrHandler.hmrHandler;

var api = exports.api = instanceHandler.api;

var use = exports.use = instanceHandler.use;

var instance = exports.instance = {
  get: function get(_ref) {
    var path = _ref.path,
        context = _ref.context;

    var localPath = (0, _helpers.getLocalPath)(path, context);

    return context.rootGetters[localPath];
  },
  dispatch: function dispatch(_ref2) {
    var path = _ref2.path,
        data = _ref2.data,
        context = _ref2.context;

    var localPath = (0, _helpers.getLocalPath)(path, context);

    return context.dispatch(localPath, data, { root: true });
  },
  commit: function commit(_ref3) {
    var path = _ref3.path,
        data = _ref3.data,
        context = _ref3.context;

    var localPath = (0, _helpers.getLocalPath)(path, context);

    return context.commit(localPath, data, { root: true });
  }
};

var storeRegistered = false;
exports.default = {
  install: function install(Vue, options) {
    Vue.mixin({
      created: function created() {
        var _this = this;

        if (!storeRegistered && module.hot && this.$store) {
          (0, _hmrHandler.setStore)(this.$store);
          storeRegistered = true;
        }
        var importer = _webpackContextVuexHmr2.default.getNewInstance();
        instanceHandler.setup(importer);

        var findModuleName = function findModuleName(parent) {
          if (!_this.storeInstanceName && parent.$parent) {
            if (!parent.$parent.storeInstanceName) {
              findModuleName(parent.$parent);
            } else {
              _this.storeInstanceName = parent.$parent.storeInstanceName;
            }
          }
        };

        findModuleName(this);

        importer.getModules();
        importer.setupHMR(_hmrHandler.hmrHandler);
      }
    });
  }
};