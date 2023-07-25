"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("bimbingans", {
      fields: ["no_bp"],
      type: "foreign key",
      name: "associate_bimbingan_mhs",
      references: {
        table: "mhs",
        field: "no_bp",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("bimbingans", {
      fields: ["nip"],
      type: "foreign key",
      name: "associate_bimbingan_dosen",
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
    await queryInterface.removeConstraint(
      "bimbingans",
      "associate_bimbingan_mhs"
    );
    await queryInterface.removeConstraint(
      "bimbingans",
      "associate_bimbingan_dosen"
    );
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
