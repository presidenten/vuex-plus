# Vuex+ [![Build Status](https://travis-ci.org/presidenten/vuex-plus.svg?branch=master)](https://travis-ci.org/presidenten/vuex-plus)
Vuex+ is an opinionated library that handles instances in Vuex and makes it easy to decide when to share state and when to use new instances.
```html
<counterGroup></counterGroup>
<counterGroup></counterGroup>
<counterGroup instance="foo"></counterGroup>
```
![piri](./docs/instances.gif)

### Heads up!!
Still prerelease, but the library should reach 1.0.0 and get a proper release by mid may. Very close now.

### Enhancements over Vuex instance handling (2.3.0)+
From Vuex 2.3.0 onward vuex supports the same notation as vue `data` property to [handle instantiation](https://vuex.vuejs.org/en/modules.html).

In most cases this will be enough, but sometimes you need something more. Here is what [vuex+](https://github.com/presidenten/vuex-plus) brings to the table:

Enhancements:
- Instances can be shared across components
- Flag to decide if the state instance should be clared when the last top level instance component is destroyed
- Submodule instances
- Generated API with magic strings in all vuex modules for getters/actions/mutations
- Generated global API with magic strings for global getters/actions/mutations
- Automatic Vuex HMR (needs naming conventions)

### How to use
Check out the extensive tutorial bundled with the example:
[https://github.com/presidenten/vuex-plus-demo](https://github.com/presidenten/vuex-plus-demo)

### Requirements
- Webpack
- Naming conventions for:
  - Vuex module filename
  - Vuex module variable names

### Todo
- Clean up comments

### Coauthor
- [Zyrica](https://github.com/zyrica)

# License
MIT
