"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mhs", {
      no_bp: {
        allowNull: false,
        primaryKey: true,
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
        type: Sequelize.CHAR(36),
      },
      name: {
        type: Sequelize.STRING,
      },
      photo: {
        type: Sequelize.BLOB("medium"),
      },
      password: {
        type: Sequelize.TEXT,
        defaultValue: "password123",
      },
      judul_acc: {
        type: Sequelize.TEXT,
      },
      prodi: {
        type: Sequelize.STRING,
      },
      tingkatan: {
        type: Sequelize.STRING,
      },
      is_usul: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status_judul: {
        type: Sequelize.ENUM("terima", "tolak", "usulan", "belum mengajukan"),
        defaultValue: "belum mengajukan",
      },
      roles: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("mhs");
  },
};
