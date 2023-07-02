"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mhs", {
      id_mhs: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      no_bp: {
        type: Sequelize.STRING,
      },
      judul_acc: {
        type: Sequelize.STRING(2500),
      },
      prodi: {
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
    });

    await queryInterface.bulkInsert("mhs", [
      {
        name: "nama1",
        no_bp: "nobp1",
        judul_acc: "judul1",
        prodi: "prodi1",
      },
      {
        name: "nama2",
        no_bp: "nobp2",
        judul_acc: "judul2",
        prodi: "prodi2",
      },
      {
        name: "nama3",
        no_bp: "nobp3",
        judul_acc: "judul3",
        prodi: "prodi3",
      },
      {
        name: "nama4",
        no_bp: "nobp4",
        judul_acc: "judul4",
        prodi: "prodi4",
      },
      {
        name: "nama5",
        no_bp: "nobp5",
        judul_acc: "judul5",
        prodi: "prodi5",
      },
      {
        name: "nama6",
        no_bp: "nobp6",
        judul_acc: "judul6",
        prodi: "prodi6",
      },
      {
        name: "nama7",
        no_bp: "nobp7",
        judul_acc: "judul7",
        prodi: "prodi7",
      },
      {
        name: "nama8",
        no_bp: "nobp8",
        judul_acc: "judul8",
        prodi: "prodi8",
      },
      {
        name: "nama9",
        no_bp: "nobp9",
        judul_acc: "judul9",
        prodi: "prodi9",
      },
      {
        name: "nama10",
        no_bp: "nobp10",
        judul_acc: "judul10",
        prodi: "prodi10",
      },
      {
        name: "nama11",
        no_bp: "nobp11",
        judul_acc: "judul11",
        prodi: "prodi11",
      },
      {
        name: "nama12",
        no_bp: "nobp12",
        judul_acc: "judul12",
        prodi: "prodi12",
      },
      {
        name: "nama13",
        no_bp: "nobp13",
        judul_acc: "judul13",
        prodi: "prodi13",
      },
      {
        name: "nama14",
        no_bp: "nobp14",
        judul_acc: "judul14",
        prodi: "prodi14",
      },
      {
        name: "nama15",
        no_bp: "nobp15",
        judul_acc: "judul15",
        prodi: "prodi15",
      },
      {
        name: "nama16",
        no_bp: "nobp16",
        judul_acc: "judul16",
        prodi: "prodi16",
      },
      {
        name: "nama17",
        no_bp: "nobp17",
        judul_acc: "judul17",
        prodi: "prodi17",
      },
      {
        name: "nama18",
        no_bp: "nobp18",
        judul_acc: "judul18",
        prodi: "prodi18",
      },
      {
        name: "nama19",
        no_bp: "nobp19",
        judul_acc: "judul19",
        prodi: "prodi19",
      },
      {
        name: "nama20",
        no_bp: "nobp20",
        judul_acc: "judul20",
        prodi: "prodi20",
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("mhs");
  },
};
