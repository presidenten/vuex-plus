let handlers = [];
let store;
export const setStore = (vuexStore) => {
  store = vuexStore;
};

export const registerForHMR = (newStore, baseStoreName, storeInstanceName) => {
  handlers.push({
    storeName: baseStoreName + '-store',
    storeInstanceName,
    newStore,
  });
};

export const unregisterForHMR = (newStore) => {
  handlers = handlers.filter(h => h.newStore !== newStore);
};

export const hmrHandler = (updatedModules) => {
  const modules = {};
  Object.keys(updatedModules).forEach((key) => {
    handlers
      .filter(handler => handler.storeName === key)
      .forEach((handler) => {
        modules[handler.storeInstanceName] = handler.newStore(updatedModules[key]);
      });
    store.hotUpdate({ modules });
  });
};
