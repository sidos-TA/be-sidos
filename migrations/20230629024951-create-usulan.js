'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usulans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_mhs: {
        type: Sequelize.INTEGER
      },
      id_dosen: {
        type: Sequelize.INTEGER
      },
      judul: {
        type: Sequelize.STRING
      },
      bidang: {
        type: Sequelize.STRING
      },
      jdl_from_dosen: {
        type: Sequelize.STRING
      },
      file_pra_proposal: {
        type: Sequelize.BLOB
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usulans');
  }
};