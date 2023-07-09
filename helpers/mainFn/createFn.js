const createFn = ({ model, data, isTransaction, transaction }) => {
  const fields = [...new Set(Object.keys(data))];

  fields?.forEach((field) => {
    if (Array.isArray(data[field])) {
      data[field] = JSON.stringify(data[field]);
    }
  });
  return model.create(
    data,
    {
      fields,
    },
    isTransaction && { transaction }
  );
};
module.exports = createFn;
