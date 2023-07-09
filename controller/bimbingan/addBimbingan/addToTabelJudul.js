const createFn = require("../../../helpers/mainFn/createFn");
const { judulData } = require("../../../models");

const addToTabelJudul = async ({ judul, bidang, tingkatan, options }) =>
  await createFn({
    model: judulData,
    data: { judul, bidang, tingkatan },
    isTransaction: true,
    transaction: options?.transaction,
  });

module.exports = { addToTabelJudul };
