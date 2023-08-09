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

      mhs.hasMany(models?.usulan, {
        foreignKey: "no_bp",
      });
      // models?.usulan.belongsTo(mhs);
    }
  }
  mhs.init(
    {
      no_bp: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.CHAR(36),
      },
      name: DataTypes.STRING,
      photo: DataTypes.BLOB("medium"),
      password: {
        type: DataTypes.TEXT,
        defaultValue: {
          type: DataTypes.TEXT,
          defaultValue: "password123",
        },
      },
      prodi: DataTypes.STRING,
      semester: {
        type: DataTypes.ENUM("ganjil", "genap"),
        defaultValue: {
          type: DataTypes.ENUM("ganjil", "genap"),
          defaultValue: "ganjil",
        },
      },
      tahun: DataTypes.STRING,
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
