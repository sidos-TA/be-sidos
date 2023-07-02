/**
 * Fungsi ini hanya untuk multiple add dan update, delete tanpa ini udh bisa
multiple delete
 */

const multipleFn = ({ model, arrDatas, type }) => {
  const fields = [...new Set(Object.keys(arrDatas[0]))];
  return model.bulkCreate(arrDatas, {
    ...(type === "update" && {
      updateOnDuplicate: fields,
    }),
    fields,
  });
};

module.exports = multipleFn;
