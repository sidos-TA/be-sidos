const sameArrObj = ({ arr = [], props }) => [
  ...new Map(arr?.map((item) => [item[props], item])).values(),
];

module.exports = sameArrObj;
