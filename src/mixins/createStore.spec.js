import createStore from './createStore.js';
import * as vuexInstance from '../vuexInstance.js';

describe('createStore', () => {
  let store;
  beforeEach(() => {
    vuexInstance.default.store = {};

    store = {
      name: 'foo',
      state: {
        count: 3,
      },
      getters: {
        getCount: jest.fn(),
      },
      actions: {
        addCount: jest.fn(),
      },
      mutations: {
        mutateCount: jest.fn(),
      },
      modules: {
        bar: {
          state: {
            chuu: 'chuu',
          },
          api: {
            get: {
              getChuu: 'bar/getChuu',
            },
            act: {
              addChuu: 'bar/addChuu',
            },
            mutate: {
              mutateChuu: 'bar/mutateChuu',
            },
            piri: {
              get: {
                getSomething: 'bar/piri/getSomething',
              },
            },
          },
          name: 'bar',
          getters: {
            chuu: jest.fn(),
          },
          actions: {
            chuu: jest.fn(),
          },
          mutations: {
            chuu: jest.fn(),
          },
          modules: {
            piri: {
              state: {
                something: 42,
              },
              api: {
                get: {
                  getSomething: 'piri/getSomething',
                },
              },
              name: 'piri',
              getters: {
                piri: jest.fn(),
              },
            },
          },
        },
      },
    };
  });

  it('sets `namespaced=true`', () => {
    const freshStore = createStore('foo$test', 'test', 'foo', store);

    expect(freshStore.namespaced).toEqual(true);
  });

  it('clones and decorates store state with \'[vuex+]\'', () => {
    const freshStore = createStore('foo$test', 'test', 'foo', store);

    expect(store.state).toEqual({
      count: 3,
    });
    expect(freshStore.state).toEqual({
      count: 3,
      'vuex+': {
        rootInstance: 'test',
        storeName: 'foo',
      },
    });
  });

  it('clones and decorates module states with \'$parent\'', () => {
    const freshStore = createStore('foo$test', 'test', 'foo', store);

    expect(freshStore.state.$parent).toEqual(undefined);
    let parent = { get: freshStore.getters, act: freshStore.actions };
    expect(freshStore.modules.bar.state.$parent).toEqual(parent);
    parent = { get: freshStore.modules.bar.getters, act: freshStore.modules.bar.actions }
    expect(freshStore.modules.bar.modules.piri.state.$parent).toEqual(parent);
  });

  it('clones all other store properties', () => {
    const freshStore = createStore('foo$test', 'test', 'foo', store);

    expect(freshStore.getters).not.toBe(undefined);
    expect(freshStore.getters).not.toBe(store.getters);
    expect(freshStore.actions).not.toBe(undefined);
    expect(freshStore.actions).not.toBe(store.actions);
    expect(freshStore.mutations).not.toBe(undefined);
    expect(freshStore.mutations).not.toBe(store.mutations);
    expect(freshStore.modules).not.toBe(undefined);
    expect(freshStore.modules).not.toBe(store.modules);
  });

  it('clones and prepare handles submodules', () => {
    const freshStore = createStore('foo$test', 'test', 'foo', store);

    expect(freshStore.modules.bar.getters).not.toBe(undefined);
    expect(freshStore.modules.bar.getters).not.toBe(store.modules.bar.getters);
    expect(freshStore.modules.bar.actions).not.toBe(undefined);
    expect(freshStore.modules.bar.actions).not.toBe(store.modules.bar.actions);
    expect(freshStore.modules.bar.mutations).not.toBe(undefined);
    expect(freshStore.modules.bar.mutations).not.toBe(store.modules.bar.mutations);
    expect(freshStore.modules.bar.modules).not.toBe(undefined);
    expect(freshStore.modules.bar.modules).not.toBe(store.modules.bar.modules);

    expect(freshStore.modules.bar.modules.piri.getters).not.toBe(undefined);
    expect(freshStore.modules.bar.modules.piri.getters).not.toBe(store.modules.bar.modules.getters);
    expect(freshStore.modules.bar.modules.piri.actions).toBe(undefined);
    expect(freshStore.modules.bar.modules.piri.mutations).toBe(undefined);
    expect(freshStore.modules.bar.modules.piri.modules).toBe(undefined);
  });
});
