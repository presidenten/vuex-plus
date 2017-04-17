const getFileName = string => string.match(/[^\\|/]*(?=[.][a-zA-Z]+$)/)[0];
const toCamelCase = string => string.replace(/(-|_)([a-z])/g, function (s) { return s[1].toUpperCase(); });

module.exports = function(source) {
  const sourcePath = this.resourcePath.replace(/\\/g, '/');
  const isSubstore = sourcePath.indexOf('-substore') >= 0;
  let filename = getFileName(sourcePath).replace(/-store|-substore/, '');
  if(isSubstore) {
    filename = toCamelCase(filename);
  }

  const exportString = 'export default store({';
  const nameString = '\n  name: \'' + filename + '\',';

  source = source.replace(exportString, exportString + nameString);
  return source;
}
