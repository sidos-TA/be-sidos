"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bimbingans", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
      },
      nip: {
        type: Sequelize.CHAR(36),
      },
      no_bp: {
        type: Sequelize.CHAR(36),
      },
      judul: {
        type: Sequelize.STRING,
      },
      bidang: {
        type: Sequelize.STRING,
      },
      status_judul: {
        type: Sequelize.ENUM("terima", "tolak"),
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
    await queryInterface.dropTable("bimbingans");
  },
};
