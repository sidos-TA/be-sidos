"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mhs", {
      no_bp: {
        primaryKey: true,
        allowNull: false,
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

      prodi: {
        type: Sequelize.STRING,
      },

      semester: {
        type: Sequelize.ENUM("ganjil", "genap"),
        defaultValue: "ganjil",
      },
      tahun: {
        type: Sequelize.STRING,
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
