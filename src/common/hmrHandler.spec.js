import * as hmr from './hmrHandler.js';
import * as vuexInstance from '../vuexInstance.js';

beforeEach(() => {
  hmr.clearHandlers();
});

describe('hmrHandler.registerForHMR', () => {
  it('should be able to register hmr for top stores', () => {
    expect(hmr.getHandlers().length).toBe(0);
    const newStore = () => {};
    hmr.registerForHMR(newStore, 'foo', 'foo$bar');
    expect(hmr.getHandlers().length).toBe(1);
    expect(hmr.getHandlers()[0]).toEqual({
      storeName: 'foo-store',
      storeInstanceName: 'foo$bar',
      newStore,
    });
  });
});

describe('hmrHandler.unregisterForHMR', () => {
  it('should be able remove handler for top store', () => {
    const newStore = () => {};
    hmr.registerForHMR(newStore, 'foo', 'foo$bar');
    hmr.unregisterForHMR(newStore);
    expect(hmr.getHandlers().length).toBe(0);
  });
});

describe('hmrHandler.hmrHandler', () => {
  it('should return a list of updated stores', () => {
    vuexInstance.default.store = {
      hotUpdate: jest.fn(),
    };

    hmr.registerForHMR(() => {}, 'foo1', 'foo1$bar1');
    const $api = {
      get: 'foo2/bar2',
      act: 'foo2/bar2',
      mutate: 'foo2/bar2',
    };
    const newStore = () => ({
      name: 'foo2',
      $api,
    });
    hmr.registerForHMR(newStore, 'foo2', 'foo2$bar2');
    hmr.registerForHMR(() => {}, 'foo3', 'foo3$bar3');

    const updatedStore = {};
    hmr.hmrHandler({ 'foo2-store': updatedStore });

    expect(vuexInstance.default.store.hotUpdate).toBeCalledWith({
      modules: {
        foo2$bar2: {
          $api,
          name: 'foo2',
        },
      },
    });
  });
});
