import map from './map.js';
import * as api from './api.js';

let store;
let subapi;

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

  api.setApi({ top: subapi, top$foo: api.remapBaseStore(subapi, 'top', 'top$foo') });
});

describe('map.getters', () => {
  it('should return global getters', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    };
    this.$store = store;
    const getters = map.getters.call(this, {
      path: 'top/subtree/path',
    });
    expect(getters.path.call(this)).toEqual(store.getters['top/subtree/path']);
  });

  it('should return global getters with instances', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top$foo',
    };
    this.instance = 'bar';
    this.$store = store;
    const getters = map.getters.call(this, {
      path: 'top$foo/subtree$bar/path',
    });
    expect(getters.path.call(this)).toEqual(store.getters['top$foo/subtree$bar/path']);
  });

  it('should return local getters', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    };
    this.$store = store;
    const getters = map.getters.call(this, {
      path: 'subtree/path',
    });
    expect(getters.path.call(this)).toEqual(store.getters['top/subtree/path']);
  });

  it('should return local getters with instances', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    };
    this.$store = store;
    this.instance = 'bar';
    const getters = map.getters.call(this, {
      path: 'subtree/path',
    });
    expect(getters.path.call(this)).toEqual(store.getters['top/subtree$bar/path']);
  });
});

describe('map.actions', () => {
  it('should return global actions', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    };
    this.$store = store;
    const actions = map.actions.call(this, {
      path: 'top/subtree/path',
    });
    actions.path.call(this, 13);
    expect(store.dispatch).toBeCalledWith('top/subtree/path', 13);
  });

  it('should return global actions with instances', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top$foo',
    };
    this.instance = 'bar';
    this.$store = store;
    const actions = map.actions.call(this, {
      path: 'top$foo/subtree$bar/path',
    });
    actions.path.call(this, 42);
    expect(store.dispatch).toBeCalledWith('top$foo/subtree$bar/path', 42);
  });

  it('should return local actions', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top',
    };
    this.$store = store;
    const actions = map.actions.call(this, {
      path: 'subtree/path',
    });
    actions.path.call(this, 19);
    expect(store.dispatch).toBeCalledWith('top/subtree/path', 19);
  });

  it('should return local actions with instances', function() { // eslint-disable-line
    this['$vuex+'] = {
      baseStoreName: 'top',
      storeInstanceName: 'top$foo',
    };
    this.$store = store;
    this.instance = 'bar';
    this.$parent = {
      instance: 'foo',
    };
    const actions = map.actions.call(this, {
      path: 'subtree/path',
    });
    actions.path.call(this, 99);
    expect(store.dispatch).toBeCalledWith('top$foo/subtree$bar/path', 99);
  });
});
