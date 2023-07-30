const updateFn = require("../../../helpers/mainFn/updateFn");
const { mhs } = require("../../../models");

const updateJudulAddJudulMhs = async ({
  judul,
  status_judul,
  options,
  no_bp,
}) => {
  return await updateFn({
    model: mhs,
    data: {
      judul_acc: judul,
      status_judul,
    },
    isTransaction: true,
    transaction: options?.transaction,
    where: {
      no_bp,
    },
  });
};

module.exports = updateJudulAddJudulMhs;
