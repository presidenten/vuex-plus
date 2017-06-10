import * as helpers from './helpers.js';

let subState, state, parentState;

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
  });

  it('replaces $root to root instance', () => {
    expect(helpers.getLocalPath('$root/count', subState)).toEqual('foo$bar/count');
  });

  it('replaces $parent to parent instance', () => {
    expect(helpers.getLocalPath('$parent/count', subState)).toEqual('foo$bar/choo$test/count');
  });

  it('makes no changes when no keywords are used', () => {
    state = {
      'vuex+': {
        storeName: 'foo',
      },
    };
    expect(helpers.getLocalPath('foo/bar/piri/choo', state)).toEqual('foo/bar/piri/choo');
  });
});

describe('helpers.getTagName', () => {
  it('returns unknown if no $parent', () => {
    expect(helpers.getTagName({})).toEqual('<unknown-tag>');
  });

  it('returns tag from $vnode', () => {
    const self = {
      $parent: {
        $vnode: {
          componentOptions: {
            tag: 'foo',
          },
        },
      },
    };
    expect(helpers.getTagName(self)).toEqual('<foo>');
  });

  it('returns tag from _vnode', () => {
    const self = {
      $parent: {
        _vnode: {
          componentOptions: {
            tag: 'foo',
          },
        },
      },
    };
    expect(helpers.getTagName(self)).toEqual('<foo>');
  });
});

describe('helpers.getInstances', () => {
  it('goes though parents and retrieves instances', () => {
    const self = {
      $parent: {
        instance: 'foo',
        $parent: {
          instance: 'bar',
          $parent: {
            instance: 'chuu',
          },
        },
      },
    };
    expect(helpers.getInstances('a/b', self)).toEqual(['$chuu', '$bar', '$foo']);
  });

  it('goes though parents and retrieves instances, and handles when parents lack instances', () => {
    const self = {
      $parent: {
        $parent: {
          $parent: {
            instance: 'chuu',
          },
        },
      },
    };
    expect(helpers.getInstances('a/b', self)).toEqual(['$chuu']);
  });

  it('adds subinstances', () => {
    const self = {
      $parent: {
        instance: 'foo',
      },
    };
    expect(helpers.getInstances('a$a1/b$b1/c$c1/d', self)).toEqual(['$foo', '$a1', '$b1', '$c1']);
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
