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
      jdl_from_dosen: DataTypes.STRING,
      file_pra_proposal: DataTypes.BLOB,
      status_usulan: {
        type: DataTypes.ENUM(
          "confirmed",
          "partially confirmed",
          "no confirm",
          "unavailable"
        ),
        defaultValue: "no confirmed",
      },
      // deletedAt: DataTypes.DATE,

      /**
       * - confirm, kalau smua usulan di konfimrasi dosen terkait
       * - partially acc, kalau hanya 1 dosen terkait yg konfirmasi
       * - no acc, belum ada dosen yang konfirmasi
       * */
    },
    {
      sequelize,
      modelName: "usulan",
      // paranoid: true,
    }
  );
  return usulan;
};
