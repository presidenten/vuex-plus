/**
 * Methods to replace normal Vuex mapGetters & mapActions.
 * These mapping functions use the vuex+ global store api like so:
 * ```
 * computed: {
 *   ...mapGetters({
 *     something: api.example.get.something,
 *   }),
 * },
 * methods: {
 *   ...mapActions({
 *     doSomething: api.example.act.doSomething,
 *   }),
 * },
 * ```
 * @param {string} baseStoreName - The base store name, same as in `store({ name })`
 * @returns {Object} { mapGetters, mapActions }
 */
export default function (baseStoreName) {
  return {
    mapGetters(map) {
      const result = {};
      Object.keys(map).forEach((key) => {
        result[key] = function get() {
          return this.$store.getters[map[key].replace(baseStoreName, this.storeInstanceName)];
        };
      });
      return result;
    },

    mapActions(map) {
      const result = {};
      Object.keys(map).forEach((key) => {
        result[key] = function dispatch(payload) {
          return this.$store.dispatch(map[key].replace(baseStoreName, this.storeInstanceName),
                                      payload);
        };
      });
      return result;
    },

  };
}
