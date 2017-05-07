import storeWrapper from './storeWrapper.js';

describe('storeWrapper', () => {
  let store;
  beforeEach(() => {
    store = {
      name: 'foo',
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

  it('adds `namespaced=true`', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.namespaced).toEqual(true);
  });

  it('adds api for getters', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.get).toEqual({ getCount: 'foo/getCount' });
  });

  it('adds api for actions', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.act).toEqual({ addCount: 'foo/addCount' });
  });

  it('adds api for mutations', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.mutate).toEqual({ mutateCount: 'foo/mutateCount' });
  });

  it('adds api for modules', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.bar.get).toEqual({ getChuu: 'foo/bar/getChuu' });
    expect(wrappedStore.api.bar.act).toEqual({ addChuu: 'foo/bar/addChuu' });
    expect(wrappedStore.api.bar.mutate).toEqual({ mutateChuu: 'foo/bar/mutateChuu' });
  });

  it('adds api for submodules', () => {
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.bar.piri.get).toEqual({ getSomething: 'foo/bar/piri/getSomething' });
  });

  it('camel cases store name in api', () => {
    store.name = 'foo-bar';
    const wrappedStore = storeWrapper(store);
    expect(wrappedStore.api.get).toEqual({ getCount: 'fooBar/getCount' });
    expect(wrappedStore.api.act).toEqual({ addCount: 'fooBar/addCount' });
    expect(wrappedStore.api.mutate).toEqual({ mutateCount: 'fooBar/mutateCount' });
    expect(wrappedStore.api.bar.get).toEqual({ getChuu: 'fooBar/bar/getChuu' });
    expect(wrappedStore.api.bar.act).toEqual({ addChuu: 'fooBar/bar/addChuu' });
    expect(wrappedStore.api.bar.mutate).toEqual({ mutateChuu: 'fooBar/bar/mutateChuu' });
    expect(wrappedStore.api.bar.piri.get).toEqual({ getSomething: 'fooBar/bar/piri/getSomething' });
  });
});
