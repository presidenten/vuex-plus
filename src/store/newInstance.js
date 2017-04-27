import clone from 'clone';

export default (substore, instance) => {
  const result = clone(substore);
  Object.keys(result.api).forEach((type) => {
    if (type === 'get' || type === 'act' || type === 'mutate') {
      Object.keys(result.api[type]).forEach((key) => {
        result.api[type][key] = result.api[type][key].split('/')[0] + '$' + instance + '/' + key;
      });
    }
  });

  return result;
};
