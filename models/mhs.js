"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mhs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mhs.init(
    {
      id_mhs: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      no_bp: DataTypes.STRING,
      judul_acc: DataTypes.STRING(2500),
      prodi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "mhs",
    }
  );
  return mhs;
};
