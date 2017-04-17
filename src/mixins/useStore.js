function ModuleLoadException(storeInstanceName) {
  this.message = 'No parent with store instance name ' + storeInstanceName + ' found';
  this.name = 'ModuleLoadException';
}

/**
 * Use a store instance.
 * Usually used by submodules to specify that they are in the same instance as their parent
 * @returns {Object} Vue module mixin
 */
export default {
  created() {
    const findModuleName = (parent) => {
      if (parent.$parent) {
        if (!parent.$parent.storeInstanceName) {
          findModuleName(parent.$parent);
        } else {
          this.storeInstanceName = parent.$parent.storeInstanceName;
        }
      } else {
        throw new ModuleLoadException(this.storeInstanceName);
      }
    };

    findModuleName(this);
  },
};
