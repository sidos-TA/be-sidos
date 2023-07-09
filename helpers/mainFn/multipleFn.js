/**
 * Fungsi ini hanya untuk multiple add dan update, delete tanpa ini udh bisa
multiple delete
 */

const multipleFn = ({
  model,
  arrDatas,
  type,
  isTransaction = false,
  transaction,
}) => {
  const fields = [...new Set(Object.keys(arrDatas[0]))];

  // kalau ada array di arrDatas, maka di JSON.stringify dulu
  arrDatas?.forEach((data) => {
    fields.forEach((field) => {
      if (Array.isArray(data[field])) {
        data[field] = JSON.stringify(data[field]);
      }
    });
  });

  return model.bulkCreate(
    arrDatas,
    {
      ...(type === "update" && {
        updateOnDuplicate: fields,
      }),
      fields,
    },
    isTransaction && { transaction }
  );
};

module.exports = multipleFn;
