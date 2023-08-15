const columnsDosen = [
  {
    label: "Nama Dosen",
    value: "name",
  },
  {
    label: "NIP",
    value: "nip",
  },
  {
    label: "Bidang",
    value: "bidangs",
  },
  {
    label: "SKS",
    value: "sks",
  },
  {
    label: "Jabatan",
    value: "jabatan",
  },
  {
    label: "Pendidikan",
    value: "pendidikan",
  },
  {
    label: "Mahasiswa Bimbingan",
    value: "n_mhs_bimbingan",
  },
  {
    label: "Mahasiswa Usulan",
    value: "n_mhs_usulan",
  },
];

const columnsMhs = [
  {
    label: "No. Bp",
    value: "no_bp",
  },
  {
    label: "Name",
    value: "name",
  },
  {
    label: "Password",
    value: "password",
  },
  {
    label: "Program Studi",
    value: "prodi",
  },
];

const columnsBimbingan = [
  {
    label: "Nama Mahasiswa",
    value: "mhs_name",
  },
  {
    label: "Judul",
    value: "judul",
  },
  {
    label: "Bidang",
    value: "bidang",
  },
  {
    label: "Program Studi",
    value: "prodi",
  },
  {
    label: "Status Judul",
    value: "status_judul",
  },
  {
    label: "Keterangan",
    value: "keterangan",
  },
  {
    label: "Dosen Pembimbing 1",
    value: "dosen_name1",
  },
  {
    label: "Dosen Pembimbing 2",
    value: "dosen_name2",
  },
];
module.exports = { columnsDosen, columnsMhs, columnsBimbingan };
