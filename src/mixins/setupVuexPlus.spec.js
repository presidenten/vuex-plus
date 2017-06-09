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
    registerModule: jest.fn(),
  };
  beforeEach(() => {
    importer = {
      getModules: jest.fn().mockReturnValue({}),
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

  it('retisters normal vuex modules', () => {
    const module = { bar: 42 };
    importer.getModules = jest.fn().mockReturnValue({
      'foo-bar-store': module,
      'not-registered-store': {
        $api: {},
        api: {},
      },
    });
    setupVuexPlus(store);
    expect(store.registerModule).toHaveBeenCalledTimes(1);
    expect(store.registerModule).toBeCalledWith('fooBar', module);
  });
});
