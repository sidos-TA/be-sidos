"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class prodi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  prodi.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes?.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      prodiName: DataTypes.STRING,
      tingkatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "prodi",
    }
  );
  return prodi;
};
