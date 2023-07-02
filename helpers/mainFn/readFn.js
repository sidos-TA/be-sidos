const readFn = ({ model, key, val, type }) => {
  if (type === "find") {
    return model.findOne({
      where: {
        [key]: val,
      },
      attributes: {
        exclude: ["id"],
      },
    });
  }
  return model.findAll({
    attributes: {
      exclude: ["id"],
    },
  });
};

module.exports = readFn;
