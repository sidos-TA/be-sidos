const updateFn = require("../../../helpers/mainFn/updateFn");
const { mhs } = require("../../../models");

const updateStatusJudul = async ({ status_judul, options, no_bp }) => {
  return await updateFn({
    model: mhs,
    data: {
      status_judul,
    },
    isTransaction: true,
    transaction: options?.transaction,
    where: {
      no_bp,
    },
  });
};

module.exports = { updateStatusJudul };
