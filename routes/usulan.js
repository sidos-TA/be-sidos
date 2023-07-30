const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { mhs, dosen, kategori, usulan, sequelize } = require("../models");
const arrJabatanDatas = require("../constants/jabatanValue");
const arrPendidikanValue = require("../constants/pendidikanValue");
const { EDAS_Winnowing } = require("../spk_module/EDAS_Winnowing");
const multipleFn = require("../helpers/mainFn/multipleFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const kalkulasiMhsValue = require("../helpers/kalkulasiMhsValue");
const { uuid } = require("uuidv4");
const updateFn = require("../helpers/mainFn/updateFn");
const formatResponseSameKey = require("../controller/bimbingan/formatResponseSameKey");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const forbiddenResponseDosen = require("../helpers/forbiddenResponseDosen");
const createFn = require("../helpers/mainFn/createFn");

// -READ-
router?.post("/getSPK", async (req, res) => {
  const { page, judul, bidang, jdl_from_dosen } = req.body;
  try {
    // const getDatasDosen = await readFn({
    //   model: dosen,
    //   type: "all",
    //   usePaginate: false,
    // });
    const getDatasDosen = await readFn({
      model: dosen,
      type: "all",
      usePaginate: false,
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("usulans.nip")), "n_mhs_usulan"],
        ],
      },
      include: [usulan],
      group: ["nip"],
    });

    const getDataKategori = await readFn({
      model: kategori,
      type: "all",
      page,
      isExcludeId: false,
      usePaginate: false,
    });

    const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
    const arrKategori = JSON.parse(JSON.stringify(getDataKategori));

    if (arrKategori?.length) {
      const arrDsnDataForSPK = arrDatasDosen.map((data) => {
        return {
          id: data?.id,
          dosenName: data?.name,
          judulPenelitian: JSON.parse(data?.penelitian)?.map(
            (penelitian) => penelitian?.title
          ),
          SKS: data?.sks,
          nMhs: data?.n_mhs_usulan,
          keahlian: JSON.parse(data?.bidang)?.includes(bidang) ? 1 : 0,
          jbtn: arrJabatanDatas?.find(
            (jbtn) => jbtn?.jabatan === data?.jabatan?.toLowerCase()
          )?.point,
          pend: arrPendidikanValue?.find(
            (pend) => pend?.pendidikan === data?.pendidikan?.toLowerCase()
          )?.point,
          isJudulDriDosen:
            jdl_from_dosen?.toLowerCase() === data?.name?.toLowerCase() ? 2 : 1,
        };
      });

      const spkResult = EDAS_Winnowing({
        strJudulMhs: judul,
        dataDosen: arrDsnDataForSPK,
        bobotKriteria: arrKategori,
      });

      const dataDosenBySPK = [];
      spkResult?.forEach((spk) => {
        arrDatasDosen?.forEach((dosen) => {
          if (dosen?.name === spk?.dosenName) {
            dataDosenBySPK.push({ ...dosen, skor: spk?.skor });
          }
        });
      });

      // res.status(200).send({ status: 200, data: dataDosenBySPK, dataUsulan });
      res.status(200).send({
        status: 200,
        data: dataDosenBySPK,
        // arrDsnDataForSPK,
        // arrDatasDosen,
      });
    } else {
      errResponse({ res, e: "Data kategori masih kosong" });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getUsulan", verifyJWT, async (req, res) => {
  const { no_bp } = req.body;
  try {
    const objSearch = filterByKey({ req });
    const getDatasUsulan = await readFn({
      model: usulan,
      type: "all",
      include: [dosen, mhs],
      where: {
        ...objSearch,
        ...(no_bp && {
          no_bp,
        }),
      },
      order: [["createdAt", "ASC"]],
    });
    const getDatasMhsByNoBp = await readFn({
      model: mhs,
      type: "find",
      where: {
        ...(no_bp && {
          no_bp,
        }),
      },
      usePaginate: false,
    });

    const arrDatasUsulan = JSON.parse(JSON.stringify(getDatasUsulan));
    const objDatasMhs = JSON.parse(JSON.stringify(getDatasMhsByNoBp));

    const arrDatas = formatResponseSameKey({
      arrDatas: arrDatasUsulan,
      propsKey: "no_bp",
      propsMergeToArray: "dosen",
    });

    res
      .status(200)
      .send({ status: 200, data: { arrDatas, is_usul: objDatasMhs?.is_usul } });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getUsulanByNoBp", verifyJWT, async (req, res) => {
  const { no_bp } = req.body;
  try {
    const getDataUsulan = await readFn({
      model: usulan,
      type: "all",

      usePaginate: false,
      isExcludeId: false,
      where: {
        no_bp,
      },
      include: [dosen],
    });

    const getDataMhs = await readFn({
      model: mhs,
      type: "find",
      usePaginate: false,
      where: {
        no_bp,
      },
    });

    const objDatasMhs = JSON.parse(JSON.stringify(getDataMhs));

    if (Object.keys(objDatasMhs)) {
      const getDatasDosen = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
        attributes: {
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("usulans.nip")),
              "n_mhs_usulan",
            ],
          ],
        },
        include: [
          {
            model: usulan,
            include: [mhs],
          },
        ],
        group: ["nip"],
      });
      const arrDatasUsulan = JSON.parse(JSON.stringify(getDataUsulan));
      const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));

      const arrDatas = [];

      arrDatasUsulan?.forEach((usul) => {
        arrDatasDosen?.forEach((dosen) => {
          if (usul?.nip === dosen?.nip) {
            arrDatas?.push(dosen);
          }
        });
      });

      res?.status(200)?.send({
        status: 200,
        data: {
          arrDatas,
          statusUsulan: arrDatasUsulan?.[0]?.status_usulan,
          mhs_name: objDatasMhs?.name,
          bidang: arrDatasUsulan?.[0]?.bidang,
          jdl_from_dosen: arrDatasUsulan?.[0]?.jdl_from_dosen,
          judul: arrDatasUsulan?.[0]?.judul,
          is_usul: objDatasMhs?.is_usul,
          tingkatan: objDatasMhs?.tingkatan,
        },
      });
    } else {
      res?.status(404)?.send({
        status: 404,
        error: `No. Bp ${no_bp} tidak ditemukan`,
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getDataBidang", async (req, res) => {
  try {
    const getDatas = await readFn({
      model: dosen,
      type: "all",
      usePaginate: false,
    });
    const arrDatas = JSON.parse(JSON.stringify(getDatas));

    const arrBidangs = arrDatas?.map((data) => JSON.parse(data?.bidang));

    const arrNotRepeatBidangs = arrBidangs?.reduce((init, curr) => {
      init = [...new Set([...init, ...curr])];
      return init;
    }, []);

    res?.status(200)?.send({ status: 200, data: arrNotRepeatBidangs });
  } catch (e) {
    errResponse({ res, e });
  }
});
// -CREATE-
router.post(
  "/addUsulan",
  verifyJWT,
  forbiddenResponseDosen,
  async (req, res) => {
    const { no_bp, nip } = req.body;
    try {
      const arrDatas = nip?.map((dataNip) => {
        return {
          ...req?.body,
          nip: dataNip,
          id: uuid(),
        };
      });

      const getDataMhs = await readFn({
        model: mhs,
        where: {
          no_bp,
        },
        type: "find",
        usePaginate: false,
        include: [usulan],
      });

      const dataMhs = JSON.parse(JSON.stringify(getDataMhs));

      // cek dulu apakah udh mengusulkan atau blm
      if (!dataMhs?.is_usul) {
        usulan.addHook("afterBulkCreate", async (usulan, options) => {
          // update status is_usul dan status judul mhs
          updateFn({
            model: mhs,
            data: {
              is_usul: true,
              status_judul: "usulan",
            },
            where: {
              no_bp,
            },
            isTransaction: true,
            transaction: options.transaction,
          });
        });

        await sequelize.transaction(async (transaction) => {
          // nip?.forEach((dataNip) => {
          //   createFn({
          //     model: usulan,
          //     data: {
          //       ...req?.body,
          //       nip: dataNip,
          //       id: uuid(),
          //     },
          //     isTransaction: true,
          //     transaction,
          //   });
          // });
          await multipleFn({
            model: usulan,
            arrDatas,
            type: "add",
            isTransaction: true,
            transaction,
          });
        });
        res
          ?.status(200)
          ?.send({ status: 200, message: "Sukses nambah usulan" });
      } else {
        throw new Error(`Mahasiswa ${dataMhs?.name} sudah mengusulkan`);
      }
    } catch (e) {
      errResponse({ res, e });

      // res?.status(400).send({ status: 400, error: e?.message });
    }
  }
);

// -UPDATE-
router.post(
  "/updateBimbingan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { nip, no_bp } = req.body;
    try {
      await sequelize.transaction(async (transaction) => {
        // ini sewaktu kaprodi ngapus usulan, dan melakukan update bimbingan

        await deleteFn({
          model: usulan,
          where: {
            no_bp,
            nip,
          },
          isTransaction: true,
          transaction,
          force: true,
        });
      });
      res
        .status(200)
        .send({ status: 200, message: "Update bimbingan berhasil" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -DELETE-
router.post("/deleteUsulan", verifyJWT, forbiddenResponse, async (req, res) => {
  const { no_bp, nip } = req.body;
  try {
    await sequelize.transaction(async (transaction) => {
      // ini sewaktu kaprodi ngapus usulan, blm update bimbingan
      await deleteFn({
        model: usulan,
        where: {
          no_bp,
          nip,
        },
        isTransaction: true,
        transaction,
      });
    });

    res.status(200).send({ status: 200, message: "Sukses hapus usulan" });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/restoreUsulan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    try {
      const nRestore = await usulan.restore();
      if (nRestore !== 0) {
        res.send({ message: `Berhasil restore data sebayak ${nRestore}` });
      } else {
        throw new Error("Tidak ada data yg direstore");
      }
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

module.exports = {
  usulanRoute: router,
};
