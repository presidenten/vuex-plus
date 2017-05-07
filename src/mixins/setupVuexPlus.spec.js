import * as hmr from 'webpack-context-vuex-hmr';
import vuexInstance from '../vuexInstance.js';
import * as addStore from './addStore.js';
import setupVuexPlus from './setupVuexPlus.js';

describe('setupVuexPlus', () => {
  let importer;
  const store = {
    getters: {},
    actions: {},
    mutations: {},
  };
  beforeEach(() => {
    importer = {
      getModules: jest.fn(),
      setupHMR: jest.fn(),
    };

    hmr.default.getNewInstance = jest.fn();
    hmr.default.getNewInstance.mockReturnValue(importer);

    addStore.setup = jest.fn();
  });

  it('sets up contextHmr', () => {
    setupVuexPlus(store);
    expect(hmr.default.getNewInstance).toBeCalled();
    expect(importer.getModules).toBeCalled();
    expect(importer.setupHMR).toBeCalled();
  });

  it('sets vuex store to vuexInstance', () => {
    setupVuexPlus(store);
    expect(vuexInstance.store).toEqual(store);
  });

  it('calls addStore.setup with the vuex store', () => {
    setupVuexPlus(store);
    expect(addStore.setup).toBeCalled();
  });
});
