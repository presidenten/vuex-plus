export const getStoreInstanceName = (storeName, instance) => {
  if (instance) {
    return storeName + '$' + instance;
  }
  return storeName;
};

export const toCamelCase = str => str.replace(/(-|_)([a-z])/g, s => s[1].toUpperCase());
