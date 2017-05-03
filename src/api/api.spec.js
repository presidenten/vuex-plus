import * as api from './api.js';
import * as helpers from '../common/helpers.js';

let subtree;
let subtree$another;
let subsubtree1;
let subsubtree2;
let map;

const originalGetInstances = helpers.getInstances;
beforeEach(() => {
  subtree = {
    get: { path: 'top/subtree/path' },
    act: { path: 'top/subtree/path' },
    mutate: { path: 'top/subtree/path' },
  };
  subtree$another = {
    get: { path: 'top/subtree$another/path' },
    act: { path: 'top/subtree$another/path' },
    mutate: { path: 'top/subtree$another/path' },
  };
  subsubtree1 = {
    get: { path: 'top/deep/subsubtree1/path' },
    act: { path: 'top/deep/subsubtree1/path' },
    mutate: { path: 'top/deep/subsubtree1/path' },
  };
  subsubtree2 = {
    get: { path: 'top/deep/subsubtree2/path' },
    act: { path: 'top/deep/subsubtree2/path' },
    mutate: { path: 'top/deep/subsubtree2/path' },
  };
  map = {
    get: {
      path: 'top/path',
    },
    act: {
      path: 'top/path',
    },
    mutate: {
      path: 'top/path',
    },
    subtree,
    subtree$another,
    deep: {
      subtree,
      subsubtree1,
      subsubtree2,
    },
  };
  api.setApi({ top: map, top$foo: api.remapBaseStore(map, 'top', 'top$foo') });

  helpers.getInstances = originalGetInstances;
});

describe('api.matchToInstances', () => {
  it('Handles paths without instances', () => {
    const result1 = 'counterGroup/anotherCounter/counter/piri';
    const result2 = 'counterGroup/anotherCounter/counter$multi/piri';
    const allResults = [
      result1,
      result2,
    ];
    const parentInstances = [];
    expect(api.matchToInstances(allResults, parentInstances)).toEqual([result1]);
  });

  it('Handles paths with instances', () => {
    const result1 = 'counterGroup/anotherCounter/counter$multi/piri';
    const result2 = 'counterGroup$foo/anotherCounter$yepp/counter$multi/piri';
    const allResults = [
      result1,
      result2,
    ];
    const parentInstances = '$foo/$yepp/$multi'.split('/');
    expect(api.matchToInstances(allResults, parentInstances)).toEqual([result2]);
  });

  it('Respects instance order', () => {
    const result1 = 'counterGroup$foo/anotherCounter$multi/counter$yepp/piri';
    const result2 = 'counterGroup$foo/anotherCounter$yepp/counter$multi/piri';
    const allResults = [
      result1,
      result2,
    ];
    const parentInstances = '$foo/$yepp/$multi'.split('/');
    expect(api.matchToInstances(allResults, parentInstances)).toEqual([result2]);
  });

  it('Handles no matches', () => {
    const result1 = 'counterGroup/anotherCounter/counter$multi/piri';
    const result2 = 'counterGroup$foo/anotherCounter$yepp/counter$multi/piri';
    const allResults = [
      result1,
      result2,
    ];
    const parentInstances = '$foo3'.split('/');
    expect(api.matchToInstances(allResults, parentInstances)).toEqual([]);
  });

  it('Handles multiple matches', () => {
    const result1 = 'counterGroup/anotherCounter/counter$multi/piri';
    const result2 = 'counterGroup$foo/anotherCounter$yepp/counter$multi/piri';
    const result3 = 'counterGroup$foo/anotherCounter$yepp/counter$multi/piri';
    const allResults = [
      result1,
      result2,
      result3,
    ];
    const parentInstances = '$foo/$yepp/$multi'.split('/');
    expect(api.matchToInstances(allResults, parentInstances)).toEqual([result2, result3]);
  });
});

describe('api.getFullPath', () => {
  beforeEach(() => {
    helpers.getInstances = jest.fn();
  });

  it('Gets full path from local path', () => {
    helpers.getInstances.mockReturnValue('$foo/$yepp/$multi'.split('/'));
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top' },
    };
    expect(api.getFullPath('subtree/path', self)).toEqual(subtree.get.path);
  });

  it('Gets full path from local path pointing deeper', () => {
    helpers.getInstances.mockReturnValue([]);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top' },
    };
    expect(api.getFullPath('subsubtree2/path', self)).toEqual(subsubtree2.get.path);
  });

  it('Gets full path from local path with known instances', () => {
    helpers.getInstances.mockReturnValue(['$foo']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    expect(api.getFullPath('subsubtree2/path', self)).toEqual(subsubtree2.get.path.replace('top', 'top$foo'));
  });

  it('Returns full paths from fulls path', () => {
    helpers.getInstances.mockReturnValue(['$another']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top' },
    };
    expect(api.getFullPath('top/subtree$another/path', self)).toEqual('top/subtree$another/path');
  });

  it('Returns full paths from fulls path with top instance', () => {
    helpers.getInstances.mockReturnValue(['$foo', '$another']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    expect(api.getFullPath('top$foo/subtree$another/path', self)).toEqual('top$foo/subtree$another/path');
  });

  it('Does not confuse key with instance', () => {
    helpers.getInstances.mockReturnValue(['$foo']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    const originalLogError = console.error;
    console.error = () => {};
    expect(api.getFullPath('foo/bar', self)).toEqual(undefined);
    console.error = originalLogError;
  });

  it('Returns undefined and logs error when api.subpath is missing', () => {
    helpers.getInstances.mockReturnValue(['$foo']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(api.getFullPath(undefined, self)).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });

  it('Returns undefined and logs error when no match', () => {
    helpers.getInstances.mockReturnValue(['$foo']);
    const self = {
      instance: '',
      '$vuex+': { baseStoreName: 'top', storeInstanceName: 'top$foo' },
    };
    const originalLogError = console.error;
    console.error = () => {};
    const logError = jest.spyOn(console, 'error');
    expect(api.getFullPath('foo/bar', self)).toEqual(undefined);
    expect(logError).toBeCalled();
    console.error = originalLogError;
  });
});

describe('api.remapBaseStore', () => {
  it('replaces base in all strings with instance name', () => {
    const remappedApi = api.remapBaseStore(map, 'top', 'top$name');
    expect(remappedApi.subtree.get.path).toEqual('top$name/subtree/path');
    expect(remappedApi.deep.subsubtree1.get.path).toEqual('top$name/deep/subsubtree1/path');
    expect(remappedApi.deep.subsubtree1.act.path).toEqual('top$name/deep/subsubtree1/path');
    expect(remappedApi.deep.subsubtree1.mutate.path).toEqual('top$name/deep/subsubtree1/path');
    expect(remappedApi.deep.subsubtree2.get.path).toEqual('top$name/deep/subsubtree2/path');
  });
});
