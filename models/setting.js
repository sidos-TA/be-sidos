"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes?.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      semester: {
        type: DataTypes.ENUM("ganjil", "genap"),
      },
      tahun: {
        type: DataTypes.STRING,
      },
      kuota_bimbingan: DataTypes.INTEGER,
      kGram: DataTypes.INTEGER,
      maksimal_usulan: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "setting",
    }
  );
  return Setting;
};
