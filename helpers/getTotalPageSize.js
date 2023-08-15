const getTotalPageSize = (arrDatasLength) => {
  return Math.max(Math.ceil(arrDatasLength / 10), 1);
};

module.exports = getTotalPageSize;
