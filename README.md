# Vuex+ [![Build Status](https://travis-ci.org/presidenten/vuex-plus.svg?branch=master)](https://travis-ci.org/presidenten/vuex-plus)
Vuex+ is an opinionated library that makes Vuex module instances possible.
```html
<counterGroup></counterGroup>
<counterGroup></counterGroup>
<counterGroup instance="foo"></counterGroup>
```
![piri](./docs/instances.gif)

**Enhancements:**
- Dynamic root level module instances that can be shared across components
- Root level instances can be persisted or cleared when components are destroyed
- Module states are decorated with a `$parent`-state getter
  - Yes, still serializable states
  - Yes, still injectable states through devtools
- Static submodule instances
- Components bound to submodules know in which statetree they belong
  - Vuex+ mapGetters and mapActions expand to full path
- Automatic Vuex HMR (needs naming conventions)
- Modules are automatically get `name` and `namespaced` parameters set
- Works side by side with normal vuex


_These enhancements from v1 are deprecated, but still working for now:_
- _(Generated API with magic strings in all vuex modules for getters/actions/mutations)_
- _(Generated global API with magic strings for global getters/actions/mutations)_

### How to use
Check out the extensive tutorial bundled with the example:
[https://github.com/presidenten/vuex-plus-demo](https://github.com/presidenten/vuex-plus-demo)

### Requirements
- Webpack
- Naming conventions for:
  - Vuex module filenames
  - Vuex submodule filenames

### Coauthor
- [Zyrica](https://github.com/zyrica)

# License
MIT
