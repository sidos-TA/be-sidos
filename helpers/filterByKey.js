const { Op } = require("sequelize");

const filterByKey = ({ req, arrSearchParams = [] }) => {
  const objSearchParams = {};

  arrSearchParams?.forEach((sParams) => {
    if (req?.body?.[sParams]) {
      objSearchParams[sParams] = {
        [Op?.like]:
          typeof req?.body?.[sParams] === "boolean"
            ? req?.body?.[sParams]
            : `%${req?.body?.[sParams]}%`,
      };
    } else {
      delete objSearchParams[sParams];
    }
  });

  return objSearchParams;
};

module.exports = filterByKey;
