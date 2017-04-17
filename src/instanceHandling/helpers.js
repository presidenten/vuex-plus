export const getStoreInstanceName = (storeName, instance) => {
  if(instance) {
    return storeName + '#' + instance;
  }
  return storeName;
}
