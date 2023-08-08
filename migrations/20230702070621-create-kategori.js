"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kategoris", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      benefitCost: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      skala: {
        type: Sequelize.STRING,
      },
      stringSkala: {
        type: Sequelize.STRING,
      },
      bobot: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable("kategoris");
  },
};
