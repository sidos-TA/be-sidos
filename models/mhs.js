"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
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
      username: DataTypes.STRING,
      password: {
        type: DataTypes.TEXT,
        defaultValue: {
          type: DataTypes.TEXT,
          defaultValue: "password123",
        },
      },
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
      roles: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
      },
    },
    {
      sequelize,
      modelName: "mhs",
    }
  );
  // mhs.beforeCreate(async (mhs) => {
  //   const dataMhs = JSON.parse(JSON.stringify(mhs));
  //   const salt = await bcrypt.genSaltSync(10, "a");
  //   mhs.password = bcrypt.hashSync(dataMhs.password, salt);
  // });
  return mhs;
};
