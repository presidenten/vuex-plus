# Vuex+
Vuex+ opinionated library that handles instances in Vuex and makes it easy to decide when to share state and when to use new instances.
```html
<counterGroup></counterGroup>
<counterGroup></counterGroup>
<counterGroup instance="foo"></counterGroup>
```
![piri](./docs/instances.gif)

### Enhancements over Vuex instance handling (2.3.0)+
From Vuex 2.3.0 onward vuex supports the same notation as vue `data` property to [handle instantiation](https://vuex.vuejs.org/en/modules.html).

In most cases this will be enough, but sometimes you need something more. Here is what [vuex+](https://github.com/presidenten/vuex-plus) brings to the table:

Enhancements:
- Instances can be shared across components
- Flag to decide if the state instance should be clared when the last top level instance component is destroyed
- Submodule instances
- Generated API for magic strings
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
- Clean up code
- Clean up comments
- Write tests

### Coauthor
- [Zyrica](https://github.com/zyrica)

# License
MIT
