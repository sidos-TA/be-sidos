const updateFn = async ({ model, data, where, isTransaction, transaction }) => {
  return await model.update(
    data,
    {
      where,
    },
    isTransaction && { transaction }
  );
};

module.exports = updateFn;
