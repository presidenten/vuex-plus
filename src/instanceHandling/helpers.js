export const getStoreInstanceName = (storeName, instance) => {
  if (instance) {
    return storeName + '#' + instance;
  }
  return storeName;
};

export const toCamelCase = str => str.replace(/(-|_)([a-z])/g, s => s[1].toUpperCase());

export const getLocalPath = (path, context) => {
  const storeName = context.state['vuex+'].storeName;
  const instance = context.state['vuex+'].instance;
  return path.replace(storeName, getStoreInstanceName(storeName, instance));
};
