import * as addStoreModule from './addStore.js';
import * as apiModule from '../api/api.js';
import * as vuexInstance from '../vuexInstance.js';

global.module = { hot: jest.fn() };

const addStore = addStoreModule.default;
const importer = {
  getModules: jest.fn(),
};
const $api = {
  get: { bar: 'foo/bar' },
  act: { bar: 'foo/bar' },
  mutate: { bar: 'foo/bar' },
};
let module;
let self;

beforeEach(() => {
  vuexInstance.default.store = {};

  module = {
    $api,
    get: jest.fn(),
    act: jest.fn(),
    mutate: jest.fn(),
  };
  self = {
    $store: {
      registerModule: jest.fn(),
      unregisterModule: jest.fn(),
      _modules: {
        root: {
          _children: {
          },
        },
      },
    },
  };
  addStoreModule.setup(importer);

  importer.getModules.mockReturnValue({ 'foo-store': module, 'bar-store': module });
});

describe('addStore => mixin', () => {
  it('exposes props', () => {
    const result = addStore('foo-store');
    expect(result.props).toEqual(['instance', 'preserve']);
  });

  describe('mixin.created', () => {
    it('adds registers module on $store', () => {
      const mixin = addStore('foo-store');
      mixin.created.call(self);
      expect(self.$store.registerModule).toBeCalled();
    });

    it('adds $vuex+ propery', () => {
      const mixin = addStore.call(self, 'foo-store');
      mixin.created.call(self);
      expect(self['$vuex+']).toEqual({
        baseStoreName: 'foo',
        moduleName: 'foo',
        storeInstanceName: 'foo',
      });
    });

    it('adds $vuex+ propery with camel cased instance', () => {
      importer.getModules.mockReturnValue({ 'foo-choo-store': module });
      self.instance = 'bar';
      const mixin = addStore.call(self, 'foo-choo-store');
      mixin.created.call(self);
      expect(self['$vuex+']).toEqual({
        baseStoreName: 'fooChoo',
        moduleName: 'fooChoo',
        storeInstanceName: 'fooChoo$bar',
      });
    });

    it('updates api with base and instance', () => {
      self.instance = 'chu';
      const mixin = addStore.call(self, 'foo-store');
      mixin.created.call(self);
      expect(apiModule.api.foo).toEqual($api);
      expect(apiModule.api.foo$chu).toEqual({
        get: { bar: 'foo$chu/bar' },
        act: { bar: 'foo$chu/bar' },
        mutate: { bar: 'foo$chu/bar' },
      });
    });
  });

  describe('mixin.destroyed', () => {
    it('removes stores without preseve=true', () => {
      const mixin = addStore.call(self, 'bar-store');
      mixin.created.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).toBeCalledWith('bar');
    });

    it('keeps stores with preseve=true', () => {
      self.preserve = true;
      const mixin = addStore.call(self, 'bar-store');
      mixin.created.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).not.toBeCalledWith('bar');
    });

    it('removes stores without preseve=true, when no instances left', () => {
      const mixin = addStore.call(self, 'bar-store');
      mixin.created.call(self);
      mixin.created.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).not.toBeCalledWith('bar');

      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).toBeCalledWith('bar');
    });
  });

  describe('HMR Handler', () => {
    it('Generates instanciator for new modules with wrapped method', () => {
      const instanceMethod = jest.fn();
      const hmrHandler = new addStoreModule.HmrHandler(instanceMethod);
      hmrHandler(42);
      expect(instanceMethod).toBeCalledWith(42);
    });
  });
});
