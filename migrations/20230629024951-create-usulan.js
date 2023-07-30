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
        // autoIncrement: true,
        // type: Sequelize.INTEGER,
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
      jdl_from_dosen: {
        type: Sequelize.STRING,
      },
      file_pra_proposal: {
        type: Sequelize.BLOB,
      },
      status_usulan: {
        type: Sequelize.ENUM(
          "confirmed",
          "partially confirmed",
          "no confirmed",
          "unavailable"
        ),
        defaultValue: "no confirmed",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      // deletedAt: {
      //   type: Sequelize.DATE,
      // },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("usulans");
  },
};
