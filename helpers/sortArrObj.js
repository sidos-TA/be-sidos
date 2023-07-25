const sortArrObj = ({ arr, props }) => {
  return arr.sort((a, b) => {
    if (a?.[props] > b?.[props]) {
      return 1;
    } else if (a?.[props] < b?.[props]) {
      return -1;
    }
    return 0;
  });
};

module.exports = sortArrObj;
