const deleteFn = ({ model, key, val }) => {
  return model.destroy({
    where: {
      [key]: val,
    },
  });
};

module.exports = deleteFn;
