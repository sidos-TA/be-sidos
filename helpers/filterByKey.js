const { Op } = require("sequelize");

const filterByKey = ({ req }) => {
  const objKeys = Object.keys(req?.body || "{}");
  const objSearch = {};

  objKeys?.forEach((key) => {
    objSearch[key] = {
      [Op?.like]:
        typeof req?.body?.[key] === "boolean"
          ? req?.body?.[key]
          : // : `%${req?.body?.[key]?.split()}%`,
            `%${req?.body?.[key]}%`,
    };
  });
  return objSearch;
};

module.exports = filterByKey;
