"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Settings", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        // autoIncrement: true,
        // type: Sequelize.INTEGER
      },
      semester: {
        type: Sequelize.ENUM("ganjil", "genap"),
      },
      tahun: {
        type: Sequelize.STRING,
      },
      kuota_bimbingan: {
        type: Sequelize.INTEGER,
      },
      kGram: {
        type: Sequelize.INTEGER,
      },
      maksimal_usulan: {
        type: Sequelize.INTEGER,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Settings");
  },
};
