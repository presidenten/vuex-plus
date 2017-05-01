import global from './global.js';
import vuexInstance from '../vuexInstance.js';

beforeEach(() => {
  vuexInstance.store = {
    getters: {
      'foo/bar': 'global getter',
      'foo$chuu/bar': 'local getter',
    },
    dispatch: jest.fn(),
    commit: jest.fn(),
  };
});

describe('global.get', () => {
  it('returns getter value for fullpath', () => {
    global.get('foo/bar');
    expect(global.get({ path: 'foo/bar' })).toEqual('global getter');
  });
  it('returns getter value for local path', () => {
    const state = {
      'vuex+': {
        storeName: 'foo',
        instance: 'chuu',
      },
    };
    expect(global.get({ path: 'foo/bar', state })).toEqual('local getter');
  });
});

describe('global.dispatch', () => {
  it('returns resulting action value for fullpath', () => {
    global.dispatch({ path: 'foo/bar', data: 42 });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo/bar', 42);
  });
  it('returns resulting action value for local path', () => {
    const state = {
      'vuex+': {
        storeName: 'foo',
        instance: 'chuu',
      },
    };
    global.dispatch({ path: 'foo/bar', data: 'huu', state });
    expect(vuexInstance.store.dispatch).toBeCalledWith('foo$chuu/bar', 'huu');
  });
});

describe('global.commit', () => {
  it('returns resulting action value for fullpath', () => {
    global.commit({ path: 'foo/bar', data: 42 });
    expect(vuexInstance.store.commit).toBeCalledWith('foo/bar', 42);
  });
  it('returns resulting action value for local path', () => {
    const state = {
      'vuex+': {
        storeName: 'foo',
        instance: 'chuu',
      },
    };
    global.commit({ path: 'foo/bar', data: 'huu', state });
    expect(vuexInstance.store.commit).toBeCalledWith('foo$chuu/bar', 'huu');
  });
});
