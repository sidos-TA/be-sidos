const errResponse = require("../helpers/errResponse");
const router = require("./router");
const readFn = require("../helpers/mainFn/readFn");
const { usulan, setting, dosen, mhs } = require("../models");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const { Op } = require("sequelize");
const sameArrObj = require("../helpers/sameArrObj");
const downloadHandler = require("../helpers/downloadHandler");
const {
  columnsDosen,
  columnsMhs,
  columnsBimbingan,
} = require("../constants/columnsDownloads");

router.post(
  "/download_bimbingan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { semester, tahun } = req.body;

    try {
      const getSetting = await readFn({
        model: setting,
      });
      const objDataSetting = JSON.parse(JSON.stringify(getSetting))?.[0];

      const getBimbingan = await readFn({
        model: usulan,
        type: "all",
        usePaginate: false,
        attributes: [
          "judul",
          "keterangan",
          "status_judul",
          "status_usulan",
          "tahun",
          "semester",
          "bidang",
        ],
        where: {
          semester: semester || objDataSetting?.semester || "",
          tahun: tahun || objDataSetting?.tahun || "",
          status_judul: { [Op.ne]: ["usulan"] },
          status_usulan: "confirmed",
        },
        include: [
          {
            model: dosen,
            attributes: ["name"],
          },
          {
            model: mhs,
            attributes: ["name", "prodi"],
          },
        ],
      });

      const arrDataBimbingan = JSON.parse(JSON.stringify(getBimbingan));

      const arrDatas = arrDataBimbingan?.map((data) => ({
        ...data,
        mhs_name: data?.mh?.name,
        prodi: data?.mh?.prodi,
        dosen_name1: arrDataBimbingan?.[0]?.dosen?.name,
        dosen_name2: arrDataBimbingan?.[1]?.dosen?.name,
      }));

      const uniqueArrDatas = sameArrObj({ arr: arrDatas, props: "judul" });

      uniqueArrDatas?.forEach((data) => {
        delete data["dosen"];
        delete data["mh"];
      });

      downloadHandler({
        arrDatas: uniqueArrDatas,
        res,
        fileName: "tes_bimbingan",
        sheetName: "Data Bimbingan",
        columns: columnsBimbingan,
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post("/download_mhs", verifyJWT, forbiddenResponse, async (req, res) => {
  const { semester, tahun } = req.body;
  try {
    const getSetting = await readFn({
      model: setting,
    });
    const objDataSetting = JSON.parse(JSON.stringify(getSetting))?.[0];

    const getDatasMhs = await readFn({
      model: mhs,
      usePaginate: false,
      where: {
        semester: semester || objDataSetting?.semester || "",
        tahun: tahun || objDataSetting?.tahun || "",
      },
      exclude: ["createdAt", "updatedAt", "roles"],
    });

    const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

    downloadHandler({
      arrDatas: arrDatasMhs,
      res,
      fileName: "tes_mhs",
      sheetName: "Data Mahasiswa",
      columns: columnsMhs,
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/download_dosen",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { semester, tahun } = req.body;
    try {
      const getSetting = await readFn({
        model: setting,
      });
      const objSetting = JSON.parse(JSON.stringify(getSetting))?.[0];

      const mhsObjModel = {
        model: mhs,
        attributes: ["semester", "tahun"],
        where: {
          semester: semester || objSetting?.semester || "",
          tahun: tahun || objSetting?.tahun || "",
        },
      };

      const getDatasDosen = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,

        attributes: ["name", "nip", "bidang", "sks", "jabatan", "pendidikan"],
      });

      const getUsulanMhsUsul = await readFn({
        model: usulan,
        attributes: ["nip", "status_judul", "status_usulan"],
        include: mhsObjModel,
      });
      const getUsulanMhsBimbing = await readFn({
        model: usulan,
        attributes: ["nip", "status_judul", "status_usulan"],
        include: mhsObjModel,
        where: {
          status_usulan: "confirmed",
        },
      });

      const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen))?.map(
        (data) => ({
          ...data,
          bidang: JSON.parse(data?.bidang?.trim() || "[]")?.join(", "),
        })
      );

      const arrUsulanMhsUsul = JSON.parse(JSON.stringify(getUsulanMhsUsul));
      const arrUsulanMhsBimbing = JSON.parse(
        JSON.stringify(getUsulanMhsBimbing)
      );

      const allData = [
        ...arrDatasDosen,
        ...arrUsulanMhsUsul,
        ...arrUsulanMhsBimbing,
      ];

      const result = Object.values(
        allData.reduce((init, curr) => {
          if (!init[curr.nip]) {
            init[curr.nip] = {
              ...curr,
              nip: curr.nip,
              n_mhs_bimbingan: 0,
              n_mhs_usulan: 0,
            };
          }

          if (arrUsulanMhsBimbing.some((mhs) => mhs.nip === curr.nip)) {
            init[curr.nip].n_mhs_bimbingan = arrUsulanMhsBimbing.filter(
              (mhs) => mhs.nip === curr.nip
            ).length;
          }

          if (arrUsulanMhsUsul.some((mhs) => mhs.nip === curr.nip)) {
            init[curr.nip].n_mhs_usulan = arrUsulanMhsUsul.filter(
              (mhs) => mhs.nip === curr.nip
            ).length;
          }

          return init;
        }, {})
      );

      downloadHandler({
        arrDatas: result,
        res,
        fileName: "Data Dosen",
        sheetName: "Data Dosen",
        columns: columnsDosen,
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

module.exports = { downloadRoute: router };
