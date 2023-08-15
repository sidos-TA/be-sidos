"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class dosen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      dosen.hasMany(models?.usulan, {
        foreignKey: "nip",
      });

      dosen.hasMany(models?.penelitian, {
        foreignKey: "nip",
      });

      dosen.hasMany(models?.bidang, {
        foreignKey: "nip",
      });

      //   // define association here
    }
  }
  dosen.init(
    {
      nip: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.CHAR(36),
      },
      name: DataTypes.STRING,
      photo: DataTypes.STRING,
      password: {
        type: DataTypes.TEXT,
        defaultValue: {
          type: DataTypes.TEXT,
          defaultValue: "password123",
        },
      },
      sks: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      pendidikan: DataTypes.STRING,
      linkDataPenelitian: DataTypes.STRING,
      roles: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "dosen",
    }
  );
  return dosen;
};
