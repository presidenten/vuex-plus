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
      moduleName: 'subtree',
      storeInstanceName: 'top',
    },
    $parent: {
      '$vuex+': {
        baseStoreName: 'top',
        moduleName: 'top',
        storeInstanceName: 'top',
      },
    },
  };
  api.setApi({ top: subapi, top$foo: api.remapBaseStore(subapi, 'top', 'top$foo') });
});

describe('map.getters', () => {
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

  it('Returns undefined and logs error when path is missing `/`', () => {
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(map.getters.call(self, {
      path: 'subtree',
    })).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });

  it('Returns undefined and logs error when path is erronious', () => {
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(map.getters.call(self, {
      path: 43,
    })).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });
});

describe('map.actions', () => {
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
      '$vuex+': {
        baseStoreName: 'top',
        moduleName: 'top',
        storeInstanceName: 'top$foo',
      },
    };
    const actions = map.actions.call(self, {
      path: 'subtree/path',
    });
    actions.path.call(self, 99);
    expect(store.dispatch).toBeCalledWith('top$foo/subtree$bar/path', 99);
  });

  it('Returns undefined and logs error when path is missing `/`', () => {
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(map.actions.call(self, {
      path: 'subtree',
    })).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });

  it('Returns undefined and logs error when path is erronious', () => {
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(map.actions.call(self, {
      path: 43,
    })).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });
});
