"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class penelitian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      penelitian.belongsTo(models?.dosen, {
        foreignKey: "nip",
      });
      // define association here
    }
  }
  penelitian.init(
    {
      nip: DataTypes.CHAR,
      judulPenelitian: DataTypes.STRING,
      link: DataTypes.STRING,
      tahun: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "penelitian",
    }
  );
  return penelitian;
};
