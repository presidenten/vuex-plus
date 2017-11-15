import * as helpers from './helpers.js';

let subState;
let state;
let parentState;
let topState;
let subtree;
let subsubtree;


describe('helpers.getStoreInstanceName', () => {
  it('should handle when no instance', () => {
    expect(helpers.getStoreInstanceName('foo')).toEqual('foo');
  });

  it('should handle when instance', () => {
    expect(helpers.getStoreInstanceName('foo', 'bar')).toEqual('foo$bar');
  });
});

describe('helpers.toCamelCase', () => {
  it('convert kebab to camel case', () => {
    expect(helpers.toCamelCase('a-foo-bar-a$b')).toEqual('aFooBarA$b');
  });
  it('convert snake to camel case', () => {
    expect(helpers.toCamelCase('a_foo_bar_a$b')).toEqual('aFooBarA$b');
  });
  it('handles numbers', () => {
    expect(helpers.toCamelCase('a-fo1o2-ba3r-4a$5b')).toEqual('aFo1o2Ba3r4a$5b');
  });
  it('keeps camel case intact', () => {
    expect(helpers.toCamelCase('aFooBarA$b')).toEqual('aFooBarA$b');
  });
  it('returns empty string if invalid value', () => {
    expect(helpers.toCamelCase(undefined)).toEqual('');
    expect(helpers.toCamelCase(5)).toEqual('');
  });
});

describe('helpers.getLocalPath', () => {
  beforeEach(() => {
    subState = {
      count: 64,
      'vuex+': {
        storeName: 'foo',
        rootInstance: 'bar',
      },
    };

    state = {
      counter$inst: subState,
      count: 42,
      'vuex+': {
        storeName: 'foo',
        rootInstance: 'bar',
      },
    };

    parentState = {
      choo$test: state,
      count: 3,
      'vuex+': {
        storeName: 'foo',
        rootInstance: 'bar',
      },
    };

    topState = {
      foo$bar: parentState,
    };

    Object.defineProperty(subState, '$parent', {
      get() {
        return state;
      },
    });
    Object.defineProperty(state, '$parent', {
      get() {
        return parentState;
      },
    });
    Object.defineProperty(parentState, '$parent', {
      get() {
        return topState;
      },
    });
  });

  it('replaces $root to root instance', () => {
    expect(helpers.getLocalPath('$root/count', subState)).toEqual('foo$bar/count');
  });

  it('replaces $parent to parent instance', () => {
    expect(helpers.getLocalPath('$parent/count', subState)).toEqual('foo$bar/choo$test/count');
  });

  it('replaces $root to root instance and $parent to parent instance', () => {
    expect(helpers.getLocalPath('$root/$parent/count', subState)).toEqual('foo$bar/choo$test/count');
  });

  it('makes no changes when no keywords are used', () => {
    expect(helpers.getLocalPath('foo/bar/piri/choo', state)).toEqual('foo/bar/piri/choo');
  });
});

describe('helpers.getSubInstances', () => {
  it('returns all instances from substring', () => {
    expect(helpers.getSubInstances('a$a1/b/c$c1/d')).toEqual(['$a1', '$c1']);
  });

  it('returns empty array on empty path', () => {
    expect(helpers.getSubInstances('')).toEqual([]);
  });
});


describe('helpers.getFullPath', () => {
  beforeEach(() => {
    subtree = {
      get: { path: 'top/subtree/path' },
      act: { path: 'top/subtree/path' },
      mutate: { path: 'top/subtree/path' },
    };
    subsubtree = {
      get: { path: 'top/deep/subsubtree/path' },
      act: { path: 'top/deep/subsubtree/path' },
      mutate: { path: 'top/deep/subsubtree/path' },
    };
  });

  it('Gets full path from local path', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', moduleName: 'subtree', storeInstanceName: 'top' },
      $parent: {
        '$vuex+': { baseStoreName: 'top', moduleName: 'top', storeInstanceName: 'top' },
      },
    };
    expect(helpers.getFullPath('subtree/path', self)).toEqual(subtree.get.path);
  });

  it('Gets full path from local path pointing deeper', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', moduleName: 'subsubtree', storeInstanceName: 'top' },
      $parent: {
        '$vuex+': { baseStoreName: 'top', moduleName: 'deep', storeInstanceName: 'top' },
        $parent: {
          '$vuex+': { baseStoreName: 'top', moduleName: 'top', storeInstanceName: 'top' },
        },
      },
    };
    expect(helpers.getFullPath('subsubtree/path', self)).toEqual(subsubtree.get.path);
  });

  it('Gets full path from local path with known instances', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', moduleName: 'subsubtree', storeInstanceName: 'top$foo' },
      $parent: {
        '$vuex+': { baseStoreName: 'top', moduleName: 'deep', storeInstanceName: 'top$foo' },
        $parent: {
          instance: 'foo',
          '$vuex+': { baseStoreName: 'top', moduleName: 'top', storeInstanceName: 'top$foo' },
        },
      },
    };
    expect(helpers.getFullPath('subsubtree/path', self)).toEqual(subsubtree.get.path.replace('top', 'top$foo'));
  });

  it('Aborts and returns path when root parent misses $vuex+', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', moduleName: 'subsubtree', storeInstanceName: 'top$foo' },
      $parent: {
        '$vuex+': { baseStoreName: 'top', moduleName: 'deep', storeInstanceName: 'top$foo' },
        $parent: {
          instance: 'foo',
        },
      },
    };
    expect(helpers.getFullPath('subsubtree/path', self)).toEqual(subsubtree.get.path.replace('top/', ''));
  });

  it('Returns undefined and logs error when api.subpath is missing', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(helpers.getFullPath(undefined, self)).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });

  it('Returns undefined and logs error when no match', () => {
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', moduleName: 'subtree', storeInstanceName: 'top$foo' },
    };
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(helpers.getFullPath('foo/bar', self)).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });
});
