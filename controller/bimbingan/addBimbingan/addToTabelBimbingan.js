const multipleFn = require("../../../helpers/mainFn/multipleFn");
const { bimbingan } = require("../../../models");

const addToTabelBimbingan = async ({ arrDatas, transaction }) => {
  return await multipleFn({
    model: bimbingan,
    arrDatas,
    type: "add",
    isTransaction: true,
    transaction,
  });
};

module.exports = { addToTabelBimbingan };
