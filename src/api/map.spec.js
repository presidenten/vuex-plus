import map from './map.js';
import * as api from './api.js';

let store;
let subapi;
let self;

beforeEach(() => {
  store = {
    getters: {
      'top/subtree/path': 'the getter',
      'top/subtree$bar/path': 'the bar getter',
      'top$foo/subtree$bar/path': 'the getter with instance',
    },
    dispatch: jest.fn(),
  };

  subapi = {
    subtree: {
      get: { path: 'top/subtree/path' },
      act: { path: 'top/subtree/path' },
    },
    subtree$bar: {
      get: { path: 'top/subtree$bar/path' },
      act: { path: 'top/subtree$bar/path' },
    },
  };

  self = {
    $store: store,
    '$vuex+': {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    },
  };
  api.setApi({ top: subapi, top$foo: api.remapBaseStore(subapi, 'top', 'top$foo') });
});

describe('map.getters', () => {
  it('should return global getters', () => {
    const getters = map.getters.call(self, {
      path: 'top/subtree/path',
    });
    expect(getters.path.call(self)).toEqual(store.getters['top/subtree/path']);
  });

  it('should return global getters with instances', () => {
    self['$vuex+'].storeInstanceName = 'top$foo';
    self.instance = 'bar';

    const getters = map.getters.call(self, {
      path: 'top$foo/subtree$bar/path',
    });
    expect(getters.path.call(self)).toEqual(store.getters['top$foo/subtree$bar/path']);
  });

  it('should return local getters', () => {
    const getters = map.getters.call(self, {
      path: 'subtree/path',
    });
    expect(getters.path.call(self)).toEqual(store.getters['top/subtree/path']);
  });

  it('should return local getters with instances', () => {
    self.instance = 'bar';
    const getters = map.getters.call(self, {
      path: 'subtree/path',
    });
    expect(getters.path.call(self)).toEqual(store.getters['top/subtree$bar/path']);
  });
});

describe('map.actions', () => {
  it('should return global actions', () => {
    const actions = map.actions.call(self, {
      path: 'top/subtree/path',
    });
    actions.path.call(self, 13);
    expect(store.dispatch).toBeCalledWith('top/subtree/path', 13);
  });

  it('should return global actions with instances', () => {
    self['$vuex+'].storeInstanceName = 'top$foo';
    self.instance = 'bar';
    const actions = map.actions.call(self, {
      path: 'top$foo/subtree$bar/path',
    });
    actions.path.call(self, 42);
    expect(store.dispatch).toBeCalledWith('top$foo/subtree$bar/path', 42);
  });

  it('should return local actions', () => {
    const actions = map.actions.call(self, {
      path: 'subtree/path',
    });
    actions.path.call(self, 19);
    expect(store.dispatch).toBeCalledWith('top/subtree/path', 19);
  });

  it('should return local actions with instances', () => {
    self['$vuex+'].storeInstanceName = 'top$foo';
    self.instance = 'bar';
    self.$parent = {
      instance: 'foo',
    };
    const actions = map.actions.call(self, {
      path: 'subtree/path',
    });
    actions.path.call(self, 99);
    expect(store.dispatch).toBeCalledWith('top$foo/subtree$bar/path', 99);
  });
});
