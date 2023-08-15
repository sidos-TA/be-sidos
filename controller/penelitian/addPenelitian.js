const deleteFn = require("../../helpers/mainFn/deleteFn");
const multipleFn = require("../../helpers/mainFn/multipleFn");
const { penelitian } = require("../../models");

const addPenelitian = ({ arrDatas, where }) => {
  deleteFn({
    model: penelitian,
    where,
  })?.then(() => {
    multipleFn({
      model: penelitian,
      arrDatas,
      type: "add",
    });
  });
};
module.exports = addPenelitian;
