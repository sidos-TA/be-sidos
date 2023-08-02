const isStringParseArr = (str) => {
  const regex = /^\s*\[\s*("[^"]*"\s*,\s*)*("[^"]*"\s*)\]\s*$/;
  return regex.test(str);
};

module.exports = isStringParseArr;
