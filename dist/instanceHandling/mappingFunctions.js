"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.default = function (baseStoreName) {
  return {
    mapGetters: function mapGetters(map) {
      var result = {};
      (0, _keys2.default)(map).forEach(function (key) {
        result[key] = function get() {
          return this.$store.getters[map[key].replace(baseStoreName, this.storeInstanceName)];
        };
      });
      return result;
    },
    mapActions: function mapActions(map) {
      var result = {};
      (0, _keys2.default)(map).forEach(function (key) {
        result[key] = function dispatch(payload) {
          return this.$store.dispatch(map[key].replace(baseStoreName, this.storeInstanceName), payload);
        };
      });
      return result;
    }
  };
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }