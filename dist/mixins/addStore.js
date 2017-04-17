'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (baseStoreName, loadedModule) {
  var counter = {};
  function HmrHandler(instanceName, getNewInstanceStore) {
    return function (newLoadedModule) {
      return getNewInstanceStore(newLoadedModule);
    };
  }

  return {
    props: ['instance', 'preserve'],
    created: function created() {
      var _this = this;

      this.storeInstanceName = (0, _helpers.getStoreInstanceName)(baseStoreName, this.instance);

      counter[this.storeInstanceName] = counter[this.storeInstanceName] || 0;
      counter[this.storeInstanceName]++;

      var getNewInstanceStore = function getNewInstanceStore(newLoadedModule) {
        return (0, _newStore2.default)(_this.storeInstanceName, _this.instance, baseStoreName, newLoadedModule);
      };

      var store = getNewInstanceStore(loadedModule);
      if (!this.$store._modules.root._children[this.storeInstanceName]) {
        this.$store.registerModule(this.storeInstanceName, store);

        if (module.hot) {
          this.$hmrHandler = new HmrHandler(this.storeInstanceName, getNewInstanceStore);
          (0, _hmrHandler.registerForHMR)(this.$hmrHandler, baseStoreName, this.storeInstanceName);
        }
      }
    },
    destroyed: function destroyed() {
      counter[this.storeInstanceName]--;

      if (!this.preserve && counter[this.storeInstanceName] === 0) {
        this.$store.unregisterModule(this.storeInstanceName);

        if (module.hot) {
          (0, _hmrHandler.unregisterForHMR)(this.$hmrHandler);
        }
      }
    }
  };
};

var _newStore = require('../instanceHandling/newStore.js');

var _newStore2 = _interopRequireDefault(_newStore);

var _helpers = require('../instanceHandling/helpers.js');

var _hmrHandler = require('../instanceHandling/hmrHandler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }