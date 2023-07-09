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

      dosen.hasMany(models?.bimbingan, {
        foreignKey: "nip",
      });

      //   // define association here
    }
  }
  dosen.init(
    {
      nip: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.CHAR(36),
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
      },
      name: DataTypes.STRING,
      bidang: DataTypes.TEXT,
      n_mhs_bimbingan: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      n_mhs_usulan: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sks: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      pendidikan: DataTypes.STRING,
      penelitian: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "dosen",
    }
  );
  return dosen;
};
