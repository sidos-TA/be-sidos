"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class judulData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  judulData.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes?.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      judul: DataTypes.STRING,
      bidang: DataTypes.STRING,
      tingkatan: DataTypes.STRING,
      file_proposal: DataTypes.BLOB,
    },
    {
      sequelize,
      modelName: "judulData",
    }
  );
  return judulData;
};
