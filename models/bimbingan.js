"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bimbingan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      bimbingan.belongsTo(models?.dosen, {
        foreignKey: "nip",
      });
      bimbingan.belongsTo(models?.mhs, {
        foreignKey: "no_bp",
      });

      // define association here
    }
  }
  bimbingan.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes?.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      no_bp: DataTypes.CHAR(36),
      nip: DataTypes.CHAR(36),
      judul: DataTypes.STRING,
      bidang: DataTypes.STRING,
      file_proposal: DataTypes.BLOB,
    },
    {
      sequelize,
      modelName: "bimbingan",
    }
  );
  return bimbingan;
};
