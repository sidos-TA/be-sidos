const createFn = ({ model, data }) => {
  return model.create(data, {
    fields: [...new Set(Object.keys(data))],
  });
};
module.exports = createFn;
