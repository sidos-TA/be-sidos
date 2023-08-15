"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("penelitians", {
      fields: ["nip"],
      type: "foreign key",
      name: "associate_dosen_penelitian",
      references: {
        table: "dosens",
        field: "nip",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "penelitians",
      "associate_dosen_penelitian"
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
