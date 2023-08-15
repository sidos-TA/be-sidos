"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usulans", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      id_usulan: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      no_bp: {
        type: Sequelize.CHAR(36),
      },
      nip: {
        type: Sequelize.CHAR(36),
      },
      judul: {
        type: Sequelize.TEXT,
      },
      bidang: {
        type: Sequelize.STRING,
      },
      semester: {
        type: Sequelize.ENUM("ganjil", "genap"),
        defaultValue: "ganjil",
      },
      tahun: {
        type: Sequelize.STRING,
      },
      jdl_from_dosen: {
        type: Sequelize.STRING,
      },
      file_pra_proposal: {
        type: Sequelize.STRING,
      },
      status_usulan: {
        type: Sequelize.ENUM("confirmed", "no confirmed"),
        defaultValue: "no confirmed",
      },
      status_judul: {
        type: Sequelize.ENUM("terima", "tolak", "revisi", "usulan"),
      },
      keterangan: {
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
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("usulans");
  },
};
