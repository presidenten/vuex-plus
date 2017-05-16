/**
 * Get store instance name
 * @param  {string} storeName Store name
 * @param  {string} instance  Instance name
 * @return {string}           Store instance name
 */
export const getStoreInstanceName = (storeName, instance) => {
  if (instance) {
    return storeName + '$' + instance;
  }
  return storeName;
};

/**
 * Convert kebab and snake case to camelCase
 * @param  {string} str The string to Convert
 * @return {string}     Camel cased string
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/(-|_)([\w])/g, s => s[1].toUpperCase());
};

/**
 * Return the local path of the instance branch
 * @param  {string} path  The global path
 * @param  {Object} state The vuex context state
 * @return {string}       The local path with all instances
 */
export const getLocalPath = (path, state) => {
  const storeName = state['vuex+'].storeName;
  const instance = state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};

/**
 * Support method that gets tag name for error logs
 * @param  {Object} self Vue component `.this`
 * @return {string}      <tag-name>
 */
export const getTagName = (self) => {
  let tag = 'unknown-tag';
  if (self.$parent) {
    const vnode = self.$parent.$vnode || self.$parent._vnode; // eslint-disable-line

    if (vnode && vnode.componentOptions && vnode.componentOptions.tag) {
      tag = vnode.componentOptions.tag;
    }
  }
  return '<' + tag + '>';
};

/**
 * Returns all instances in the current instance branch as an ordered array
 * @param  {string} subpath The subpath to explore
 * @param  {Object} self    Vue component `.this`
 * @return {array}          The instances as array
 */
export const getInstances = (subpath, self) => {
  let path = self.instance ? '/$' + self.instance : '';
  let parent = self;

  while (parent.$parent) {
    parent = parent.$parent;
    const suffix = parent.instance ? '$' + parent.instance + '/' : '';
    if (suffix) path = suffix + path;
  }

  const instances = path === '' ? [] : path.split('/').filter(i => i.length);

  if (subpath) {
    const subInstances = subpath.match(/\$\w+/g);
    if (subInstances) {
      subInstances.forEach((instance) => {
        instances.push(instance);
      });
    }
  }

  return instances;
};

/**
 * Returns subInstances from local path
 * @param  {string} path Path to explore
 * @return {array}       Subinstances as ordered array
 */
export const getSubInstances = (path) => {
  if (path) {
    const subInstances = path.match(/\$\w*/g);
    return subInstances;
  }

  return [];
};
