"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class dosen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    // }
  }
  dosen.init(
    {
      id_dosen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      nip: DataTypes.STRING,
      bidang: DataTypes.STRING(2500),
      n_mhs_bimbingan: DataTypes.INTEGER,
      n_mhs_usulan: DataTypes.INTEGER,
      sks: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      pendidikan: DataTypes.STRING,
      penelitian: DataTypes.STRING(2500),
    },
    {
      sequelize,
      modelName: "dosen",
    }
  );
  return dosen;
};
