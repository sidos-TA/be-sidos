"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dosens", {
      nip: {
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
      },

      bidang: {
        type: Sequelize.TEXT,
      },

      sks: {
        type: Sequelize.INTEGER,
      },
      jabatan: {
        type: Sequelize.STRING,
      },
      pendidikan: {
        type: Sequelize.STRING,
      },
      penelitian: {
        type: Sequelize.TEXT,
      },
      linkDataPenelitian: {
        type: Sequelize.STRING,
      },
      roles: {
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

  async down(queryInterface) {
    await queryInterface.dropTable("dosens");
  },
};
