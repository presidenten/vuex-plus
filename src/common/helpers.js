export const getStoreInstanceName = (storeName, instance) => {
  if (instance) {
    return storeName + '$' + instance;
  }
  return storeName;
};


export const toCamelCase = (str) => {
  if (!str) {
    return '';
  }
  return str.replace(/(-|_)([\w])/g, s => s[1].toUpperCase());
};


export const getLocalPath = (path, state) => {
  const storeName = state['vuex+'].storeName;
  const instance = state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};


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


export const getSubInstances = (path) => {
  if (path) {
    const subInstances = path.match(/\$\w*/g);
    return subInstances;
  }

  return [];
};
