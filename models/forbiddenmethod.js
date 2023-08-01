"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class forbiddenMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  forbiddenMethod.init(
    {
      methodName: DataTypes.STRING,
      bidang: DataTypes.STRING,
      tingkatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "forbiddenMethod",
    }
  );
  return forbiddenMethod;
};
