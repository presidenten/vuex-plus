import * as registerModule from './register.js';
import * as vuexInstance from '../vuexInstance.js';

global.module = { hot: jest.fn() };

const register = registerModule.default;
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
    $options: {
      propsData: {
      },
    },
  };
  registerModule.setup(importer);

  importer.getModules.mockReturnValue({ 'foo-store': module });
});

describe('register => mixin', () => {
  it('exposes props', () => {
    const result = register('foo-store');
    expect(result.props).toEqual(['instance', 'preserve']);
  });

  describe('mixin.created', () => {
    it('adds registers module on $store', () => {
      const mixin = register('foo-store');
      mixin.beforeCreate.call(self);
      expect(self.$store.registerModule).toBeCalled();
      mixin.destroyed.call(self);
    });

    it('adds $vuex+ propery', () => {
      const mixin = register.call(self, 'foo-store');
      mixin.beforeCreate.call(self);
      expect(self['$vuex+']).toEqual({
        baseStoreName: 'foo',
        moduleName: 'foo',
        storeInstanceName: 'foo',
      });
      mixin.destroyed.call(self);
    });

    it('adds $vuex+ propery with camel cased instance', () => {
      importer.getModules.mockReturnValue({ 'foo-choo-store': module });
      self.$options.propsData.instance = 'bar';
      const mixin = register.call(self, 'foo-choo-store');
      mixin.beforeCreate.call(self);
      expect(self['$vuex+']).toEqual({
        baseStoreName: 'fooChoo',
        moduleName: 'fooChoo',
        storeInstanceName: 'fooChoo$bar',
      });
      mixin.destroyed.call(self);
    });
  });

  describe('mixin.destroyed', () => {
    it('removes stores without preseve=true', () => {
      const mixin = register.call(self, 'foo-store');
      mixin.beforeCreate.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).toBeCalledWith('foo');
    });

    it('keeps stores with preseve=true', () => {
      self.preserve = true;
      const mixin = register.call(self, 'foo-store');
      mixin.beforeCreate.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).not.toBeCalledWith('foo');
    });

    it('removes stores without preseve=true, when no instances left', () => {
      const mixin = register.call(self, 'foo-store');
      mixin.beforeCreate.call(self);
      mixin.beforeCreate.call(self);
      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).not.toBeCalledWith('foo');

      mixin.destroyed.call(self);
      expect(self.$store.unregisterModule).toBeCalledWith('foo');
    });
  });

  describe('HMR Handler', () => {
    it('Generates instanciator for new modules with wrapped method', () => {
      const instanceMethod = jest.fn();
      const hmrHandler = new registerModule.HmrHandler(instanceMethod);
      hmrHandler(42);
      expect(instanceMethod).toBeCalledWith(42);
    });
  });
});
