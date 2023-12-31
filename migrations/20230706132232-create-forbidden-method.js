"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("forbiddenMethods", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        // autoIncrement: true,
        // type: Sequelize.INTEGER
      },
      methodName: {
        type: Sequelize.STRING,
      },
      bidang: {
        type: Sequelize.STRING,
      },
      tingkatan: {
        type: Sequelize.STRING,
      },
      semester: {
        type: Sequelize.ENUM("ganjil", "genap"),
        defaultValue: "ganjil",
      },
      tahun: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("forbiddenMethods");
  },
};
