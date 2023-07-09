const kalkulasiMhsValue = require("../../../helpers/kalkulasiMhsValue");

const dec_nMhsBimbingan = async ({ options, nip }) => {
  return await kalkulasiMhsValue({
    act: "dec_n_mhs",
    propsCalculate: "n_mhs_bimbingan",
    transaction: options?.transaction,
    where: {
      nip,
    },
  });
};

module.exports = { dec_nMhsBimbingan };
