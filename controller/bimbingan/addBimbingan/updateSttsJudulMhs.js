const updateFn = require("../../../helpers/mainFn/updateFn");
const { usulan } = require("../../../models");

const updateSttsJudulMhs = async ({ status_judul, keterangan, no_bp }) => {
  return await updateFn({
    model: usulan,
    data: {
      status_judul,
      keterangan,
    },
    where: {
      no_bp,
    },
  });
};

module.exports = updateSttsJudulMhs;
