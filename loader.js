const getFileName = string => string.match(/[^\\|/]*(?=[.][a-zA-Z]+$)/)[0];
const toCamelCase = string => string.replace(/(-|_)([a-z])/g, s => s[1].toUpperCase());

module.exports = function vuexPlusLoader(source) {
  const sourcePath = this.resourcePath.replace(/\\/g, '/');
  let filename = getFileName(sourcePath).replace(/-store|-substore/, '');
  filename = toCamelCase(filename);

  const exportString = 'export default store({';
  const nameString = '\n  name: \'' + filename + '\',';

  source = source.replace(exportString, exportString + nameString);

  return source;
};
