import clone from 'clone';
import { remapBaseStore } from '../api/api.js';

/**
 * Make new instance with remapped api.
 * @param  {Object} substore The substore to remap and clone
 * @param  {string} instance Instance name
 * @return {Object}          Remapped store
 */
export default (substore, instance) => {
  const result = clone(substore);
  result.api = remapBaseStore(result.api, result.name, result.name + '$' + instance);
  return result;
};
