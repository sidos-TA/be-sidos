"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("usulans", {
      fields: ["id_mhs"],
      type: "foreign key",
      name: "associate_usul_mhs",
      references: {
        table: "mhs",
        field: "id_mhs",
      },
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("usulans", {
      fields: ["id_dosen"],
      type: "foreign key",
      name: "associate_usul_dosen",
      references: {
        table: "dosens",
        field: "id_dosen",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("usulans", "associate_usul_mhs");
    await queryInterface.removeConstraint("usulans", "associate_usul_dosen");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
