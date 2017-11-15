import root from './root.js';
import vuexInstance from '../vuexInstance.js';

let state;
let vnode;
beforeEach(() => {
  vuexInstance.store = {
    getters: {
      'foo/bar': 'root getter',
      'foo$chuu/bar': 'local getter',
      'foo$chuu/choo$test/count': 'local getter',
    },
    dispatch: jest.fn(),
    commit: jest.fn(),
  };

  state = {
    count: 42,
    'vuex+': {
      storeName: 'foo',
      rootInstance: 'chuu',
    },
  };

  vnode = {
    '$vuex+': {
      storeInstanceName: 'foo$chuu',
    },
  };

  const parentState = {
    choo$test: state,
    bar: 3,
    'vuex+': {
      storeName: 'foo',
      rootInstance: 'chuu',
    },
  };

  const topState = {
    foo$chuu: parentState,
  };

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

describe('root.get', () => {
  it('returns getter value for absolute path', () => {
    root.get('foo/bar');
    expect(root.get({ path: 'foo/bar' })).toEqual('root getter');
  });
  it('returns getter value for $root path', () => {
    expect(root.get({ path: '$root/bar', state })).toEqual('local getter');
  });
  it('returns getter value for $root path in vue components', () => {
    expect(root.get({ path: '$root/bar', vnode })).toEqual('local getter');
  });
  it('returns getter value for $parent path', () => {
    expect(root.get({ path: '$parent/bar', state })).toEqual('local getter');
  });
});

describe('root.dispatch', () => {
  it('returns resulting action value for absolute path', () => {
    root.dispatch({ path: 'foo/bar', data: 42 });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo/bar', 42);
  });
  it('returns resulting action value for $root path', () => {
    root.dispatch({ path: '$root/bar', data: 'huu', state });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo$chuu/bar', 'huu');
  });
  it('returns resulting action value for $root path in vue components', () => {
    root.dispatch({ path: '$root/bar', data: 'huu', vnode });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo$chuu/bar', 'huu');
  });
  it('returns resulting action value for $parent path', () => {
    root.dispatch({ path: '$parent/bar', data: 'huu', state });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo$chuu/bar', 'huu');
  });
});

describe('root.commit', () => {
  it('returns resulting action value for absolute path', () => {
    root.commit({ path: 'foo/bar', data: 42 });
    expect(vuexInstance.store.commit).toBeCalledWith('foo/bar', 42);
  });
  it('returns resulting action value for $root path', () => {
    root.commit({ path: '$root/bar', data: 'huu', state });
    expect(vuexInstance.store.commit).toBeCalledWith('foo$chuu/bar', 'huu');
  });
  it('returns resulting action value for $root path in vue componentsq', () => {
    root.commit({ path: '$root/bar', data: 'huu', vnode });
    expect(vuexInstance.store.commit).toBeCalledWith('foo$chuu/bar', 'huu');
  });
  it('returns resulting action value for $parent path', () => {
    root.commit({ path: '$parent/bar', data: 'huu', state });
    expect(vuexInstance.store.commit).toBeCalledWith('foo$chuu/bar', 'huu');
  });
});
