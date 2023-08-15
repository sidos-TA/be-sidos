"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bidang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      bidang.belongsTo(models?.dosen, {
        foreignKey: "nip",
      });
      // define association here
    }
  }
  bidang.init(
    {
      nip: DataTypes.CHAR,
      bidang: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "bidang",
    }
  );
  return bidang;
};
