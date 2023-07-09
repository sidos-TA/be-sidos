const kalkulasiMhsValue = require("../../../helpers/kalkulasiMhsValue");

const inc_nMhsBimbingan = async ({ nip, options }) => {
  return await kalkulasiMhsValue({
    act: "inc_n_mhs",
    where: {
      nip,
    },
    propsCalculate: "n_mhs_bimbingan",
    transaction: options?.transaction,
  });
};

module.exports = { inc_nMhsBimbingan };
