import installModule from './install.js';

describe('install', () => {
  let Vue;
  let mixin;
  beforeEach(() => {
    Vue = {
      mixin: (m) => {
        mixin = m;
      },
    };
  });

  it('triggers vue mixin', () => {
    Vue.mixin = jest.fn();
    installModule.install(Vue);

    expect(Vue.mixin).toBeCalled();
  });

  it('registers instance prop', () => {
    installModule.install(Vue);

    expect(mixin.props).toEqual(['instance']);
  });

  it('sets baseStoreName and storeInstanceName from parent', () => {
    const self = {
      $parent: {
        '$vuex+': {
          baseStoreName: 'foo',
          storeInstanceName: 'foo$bar',
        },
      },
    };

    installModule.install(Vue);
    mixin.created.call(self);

    expect(self['$vuex+']).toEqual({
      baseStoreName: 'foo',
      storeInstanceName: 'foo$bar',
    });
  });

  it('sets baseStoreName and storeInstanceName from parents higher in tree', () => {
    const self = {
      $parent: {
        $parent: {
          $parent: {
            $parent: {
              '$vuex+': {
                baseStoreName: 'foo',
                storeInstanceName: 'foo$bar',
              },
            },
          },
        },
      },
    };

    installModule.install(Vue);
    mixin.created.call(self);

    expect(self['$vuex+']).toEqual({
      baseStoreName: 'foo',
      storeInstanceName: 'foo$bar',
    });
  });
});
