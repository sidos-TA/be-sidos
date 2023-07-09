const deleteFn = require("../../../helpers/mainFn/deleteFn");
const { bimbingan } = require("../../../models");

const deleteDataBimbingan = async ({ nip, no_bp }) => {
  return await deleteFn({
    model: bimbingan,
    where: {
      nip,
      no_bp,
    },
  });
};

module.exports = { deleteDataBimbingan };
