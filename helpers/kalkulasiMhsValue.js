const readFn = require("./mainFn/readFn");
const { dosen } = require("../models");
const multipleFn = require("./mainFn/multipleFn");

const kalkulasiMhsValue = async ({
  act,
  where,
  propsCalculate,
  transaction,
}) => {
  const getDosensSelected = await readFn({
    model: dosen,
    where,
    usePaginate: false,
  });

  const arrDosensSelect = JSON.parse(JSON.stringify(getDosensSelected));

  const updateDosensSelect = arrDosensSelect?.map((dataDosen) => {
    return {
      ...dataDosen,
      [propsCalculate]:
        act === "dec_n_mhs"
          ? dataDosen?.[propsCalculate] - 1
          : dataDosen?.[propsCalculate] + 1,
    };
  });

  return multipleFn({
    model: dosen,
    arrDatas: updateDosensSelect,
    type: "update",
    isTransaction: true,
    transaction,
  });
};

module.exports = kalkulasiMhsValue;
