const deleteFn = require("../../../helpers/mainFn/deleteFn");
const { usulan } = require("../../../models");

const deleteIfSttsUsulanNotConfirm = async ({ no_bp, options }) => {
  return await deleteFn({
    model: usulan,
    where: {
      no_bp,
    },
    isTransaction: true,
    transaction: options?.transaction,
  });
};
module.exports = deleteIfSttsUsulanNotConfirm;
