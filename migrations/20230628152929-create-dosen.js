"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dosens", {
      nip: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.CHAR(36),
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
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
      roles: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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
