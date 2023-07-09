"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mhs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // // define association here
      mhs.hasMany(models?.bimbingan, {
        foreignKey: "no_bp",
      });
      mhs.hasMany(models?.usulan, {
        foreignKey: "no_bp",
      });
      // models?.usulan.belongsTo(mhs);
    }
  }
  mhs.init(
    {
      no_bp: {
        allowNull: false,
        primaryKey: true,
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
        type: DataTypes.CHAR(36),
      },
      name: DataTypes.STRING,
      judul_acc: DataTypes.TEXT,
      prodi: DataTypes.STRING,
      tingkatan: DataTypes.STRING,
      is_usul: { type: DataTypes.BOOLEAN, defaultValue: false },
      status_judul: {
        type: DataTypes.ENUM("terima", "tolak", "usulan", "belum mengajukan"),
        defaultValue: {
          type: DataTypes.ENUM("terima", "tolak", "usulan", "belum mengajukan"),
          defaultValue: "belum mengajukan",
        },
      },
    },
    {
      sequelize,
      modelName: "mhs",
    }
  );
  return mhs;
};
