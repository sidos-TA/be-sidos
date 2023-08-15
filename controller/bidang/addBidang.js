const deleteFn = require("../../helpers/mainFn/deleteFn");
const multipleFn = require("../../helpers/mainFn/multipleFn");
const { bidang } = require("../../models");

const addBidang = ({ arrDatas, where }) => {
  deleteFn({
    model: bidang,
    where,
  })?.then(() => {
    multipleFn({
      model: bidang,
      arrDatas,
      type: "add",
    });
  });
};
module.exports = addBidang;
