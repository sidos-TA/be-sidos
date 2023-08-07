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
      usulan.belongsTo(models?.dosen, {
        foreignKey: "nip",
      });
      usulan.belongsTo(models?.mhs, {
        foreignKey: "no_bp",
      });

      // define association here
    }
  }
  usulan.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes?.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      no_bp: DataTypes.CHAR(36),
      nip: DataTypes.CHAR(36),
      judul: DataTypes.TEXT,
      bidang: DataTypes.STRING,
      semester: {
        type: DataTypes.ENUM("ganjil", "genap"),
        defaultValue: {
          type: DataTypes.ENUM("ganjil", "genap"),
          defaultValue: "ganjil",
        },
      },
      tahun: DataTypes.STRING,
      jdl_from_dosen: DataTypes.STRING,
      file_pra_proposal: DataTypes.BLOB,
      status_usulan: {
        type: DataTypes.ENUM("confirmed", "no confirm"),
        defaultValue: "no confirmed",
      },
      status_judul: {
        type: DataTypes.ENUM("terima", "tolak", "revisi", "usulan"),
      },
      keterangan: DataTypes.STRING,
      deletedAt: DataTypes.DATE,

      /**
       * - confirm, kalau smua usulan di konfimrasi dosen terkait
       * - no confirm, belum digubris sama kaprodi
       * */
    },
    {
      sequelize,
      modelName: "usulan",
      paranoid: true,
    }
  );
  return usulan;
};
