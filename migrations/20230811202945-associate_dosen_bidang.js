"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("bidangs", {
      fields: ["nip"],
      type: "foreign key",
      name: "associate_dosen_bidang",
      references: {
        table: "dosens",
        field: "nip",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("bidangs", "associate_dosen_bidang");
  },
};
