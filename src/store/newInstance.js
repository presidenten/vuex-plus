import clone from 'clone';
import { remapBaseStore } from '../api/api.js';

export default (substore, instance) => {
  const result = clone(substore);
  result.api = remapBaseStore(result.api, result.name, result.name + '$' + instance);
  return result;
};
