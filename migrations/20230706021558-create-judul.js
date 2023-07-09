"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("judulData", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
      },
      judul: {
        type: Sequelize.STRING,
      },
      bidang: {
        type: Sequelize.STRING,
      },
      tingkatan: {
        type: Sequelize.STRING,
      },
      file_proposal: {
        type: Sequelize.BLOB,
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
    await queryInterface.dropTable("judulData");
  },
};
