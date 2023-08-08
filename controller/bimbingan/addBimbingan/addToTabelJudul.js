const createFn = require("../../../helpers/mainFn/createFn");
const { judulData } = require("../../../models");

const addToTabelJudul = async ({ judul, bidang, tingkatan }) => {
  return await createFn({
    model: judulData,
    data: { judul, bidang, tingkatan },
  });
};

module.exports = { addToTabelJudul };
