# Vuex+
Opinionated library that handles instances in Vuex.
Vuex+ uses Webpack to handle some automation.

...instructions are on their way. Until then take a sneak peak at [https://github.com/presidenten/vuex-plus-demo](https://github.com/presidenten/vuex-plus-demo) to see what it is all about.


### Enhancements over Vuex instance handling (2.3.0)+
From Vuex 2.3.0 onward vuex supports the same notation as vue `data` property to [handle instantiation](https://vuex.vuejs.org/en/modules.html).

In most cases this will be enough, but sometimes you need something more. Here is what [vuex+](https://github.com/presidenten/vuex-plus) brings to the table:

Enhancements:
- Instances can be shared across components
- Flag to decide if the state instance should be clared when the last instance component is destroyed
- Generated API for magic strings
- Naming conventions to support automatic HMR out of the box

Limitations:
- Instances populates the vuex store at top level

### Authors
- [Zyrica](https://github.com/zyrica)
- [Presidenten](https://github.com/persidenten)

# License
MIT
