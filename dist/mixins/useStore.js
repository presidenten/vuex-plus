'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function ModuleLoadException(storeInstanceName) {
  this.message = 'No parent with store instance name ' + storeInstanceName + ' found';
  this.name = 'ModuleLoadException';
}

exports.default = {
  created: function created() {
    var _this = this;

    var findModuleName = function findModuleName(parent) {
      if (parent.$parent) {
        if (!parent.$parent.storeInstanceName) {
          findModuleName(parent.$parent);
        } else {
          _this.storeInstanceName = parent.$parent.storeInstanceName;
        }
      } else {
        throw new ModuleLoadException(_this.storeInstanceName);
      }
    };

    findModuleName(this);
  }
};