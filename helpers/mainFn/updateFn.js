const updateFn = ({ model, data, key, val }) => {
  return model.update(data, {
    where: {
      [key]: val,
    },
  });
};

module.exports = updateFn;
