import newInstance from './newInstance.js';

describe('newInstance', () => {
  it('returns remapped store', () => {
    const instance = newInstance({
      name: 'foo',
      api: {
        get: {
          count: 'foo/count',
        },
      },
      getters: { id: 1 },
      actions: { id: 1 },
      mutations: { id: 1 },
      modules: { id: 1 },
    }, 'bar');

    expect(instance).toEqual({
      name: 'foo',
      api: {
        get: {
          count: 'foo$bar/count',
        },
      },
      getters: { id: 1 },
      actions: { id: 1 },
      mutations: { id: 1 },
      modules: { id: 1 },
    });
  });
});
