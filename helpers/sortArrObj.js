const sortArrObj = ({ arr, props, sortType = "ASC" }) => {
  return arr.sort((a, b) => {
    if (a?.[props] > b?.[props]) {
      return sortType === "ASC" ? 1 : -1;
    } else if (a?.[props] < b?.[props]) {
      return sortType === "ASC" ? -1 : 1;
    }
    return 0;
  });
};

module.exports = sortArrObj;
