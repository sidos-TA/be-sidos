"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("usulans", {
      fields: ["no_bp"],
      type: "foreign key",
      name: "associate_usul_mhs",
      references: {
        table: "mhs",
        field: "no_bp",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("usulans", {
      fields: ["nip"],
      type: "foreign key",
      name: "associate_usul_dosen",
      references: {
        table: "dosens",
        field: "nip",
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

  async down(queryInterface) {
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
