"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class usulan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  usulan.init(
    {
      id_mhs: DataTypes.INTEGER,
      id_dosen: DataTypes.INTEGER,
      judul: DataTypes.STRING,
      bidang: DataTypes.STRING,
      jdl_from_dosen: DataTypes.STRING,
      file_pra_proposal: DataTypes.BLOB,
    },
    {
      sequelize,
      modelName: "usulan",
    }
  );
  return usulan;
};
