const kalkulasiMhsValue = require("../../../helpers/kalkulasiMhsValue");

const dec_nMhsUsulan = async ({ options, nip }) => {
  return await kalkulasiMhsValue({
    act: "dec_n_mhs",
    propsCalculate: "n_mhs_usulan",
    transaction: options?.transaction,
    where: {
      nip,
    },
  });
};

module.exports = { dec_nMhsUsulan };
