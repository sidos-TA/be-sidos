const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const {
  mhs,
  dosen,
  kategori,
  judulData,
  usulan,
  setting,
  sequelize,
} = require("../models");
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
const isStringParseArr = require("../helpers/isStringParseArr");
const { jaccardSimilarityHandler } = require("../spk_module/Winnowing");
const { uniqueArrObj } = require("../helpers/uniqueArr_ArrObj");
const sortArrObj = require("../helpers/sortArrObj");
const yearNow = require("../constants/yearNow");
const { where, Op } = require("sequelize");

// -READ-
router?.post("/getSPK", async (req, res) => {
  const {
    page,
    judul,
    bidang,
    jdl_from_dosen,
    semester,
    tahun = yearNow,
  } = req.body;
  try {
    const getSetting = await readFn({
      model: setting,
    });
    const arrSetting = JSON.parse(JSON.stringify(getSetting));

    const objSearch = filterByKey({ req });

    delete objSearch["usePaginate"];
    delete objSearch["showRoles"];
    delete objSearch["semester"];
    delete objSearch["tahun"];

    const attrDosen = [
      "name",
      "nip",
      "sks",
      "jabatan",
      "pendidikan",
      "bidang",
      "penelitian",
    ];

    const getDatas = await readFn({
      model: dosen,
      type: "all",
      page,
      usePaginate: false,
      attributes: attrDosen,
    });

    const getUsulanMhsUsul = await readFn({
      model: usulan,
      attributes: ["nip", "status_judul", "status_usulan"],
      where: {
        semester: semester || arrSetting?.[0]?.semester || "",
        tahun: tahun || "",
      },
    });
    const getUsulanMhsBimbing = await readFn({
      model: usulan,
      attributes: ["nip", "status_judul", "status_usulan"],
      where: {
        status_usulan: "confirmed",
        semester: semester || arrSetting?.[0]?.semester || "",
        tahun: tahun || "",
      },
    });

    const arrDatas = JSON.parse(JSON.stringify(getDatas));
    const arrUsulanMhsUsul = JSON.parse(JSON.stringify(getUsulanMhsUsul));
    const arrUsulanMhsBimbing = JSON.parse(JSON.stringify(getUsulanMhsBimbing));

    const allData = [...arrDatas, ...arrUsulanMhsUsul, ...arrUsulanMhsBimbing];

    // proses penentuan n_mhs_bimbingan dan n_mhs_usulan
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

    const getDataKategori = await readFn({
      model: kategori,
      type: "all",
      page,
      isExcludeId: false,
      usePaginate: false,
    });

    const arrKategori = JSON.parse(JSON.stringify(getDataKategori));

    if (arrKategori?.length) {
      const arrDsnDataForSPK = result.map((data) => {
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
        result?.forEach((dosen) => {
          if (dosen?.name === spk?.dosenName) {
            dataDosenBySPK.push({ ...dosen, skor: spk?.skor });
          }
        });
      });

      res.status(200).send({
        status: 200,
        data: dataDosenBySPK,
      });
    } else {
      errResponse({ res, e: "Data kategori masih kosong" });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getUsulan", verifyJWT, async (req, res) => {
  const { no_bp, status_judul, semester, tahun = yearNow } = req.body;
  try {
    const objSearch = filterByKey({ req });

    const getDataSettings = await readFn({
      model: setting,
      type: "all",
    });

    if (getDataSettings?.length) {
      // skenario utk keputusan dan status judul tlah dikirim
      if (status_judul) {
        delete objSearch["status_judul"];
        objSearch["$mh.status_judul$"] = status_judul;
      }

      const getDatasUsulan = await readFn({
        model: usulan,
        type: "all",
        exclude: [
          "nip",
          "updatedAt",
          "deletedAt",
          "file_pra_proposal",
          "jdl_from_dosen",
          "keterangan",
        ],
        include: [
          {
            model: mhs,
            where: {
              ...(status_judul && {
                ...(no_bp && {
                  "$mh.no_bp$": no_bp,
                }),
                "$mh.status_judul$": status_judul,
              }),
              // "$mh.semester$": semester || getDataSettings?.[0]?.semester,
              // "$mh.tahun$": tahun,
            },
            attributes: {
              exclude: ["password", "roles", "no_bp"],
            },
          },
        ],

        where: {
          ...objSearch,
          semester: semester || getDataSettings?.[0]?.semester,
          tahun,
        },
        group: ["no_bp"],
      });

      const arrDatasUsulan = JSON.parse(JSON.stringify(getDatasUsulan));

      res.status(200).send({
        status: 200,
        data: arrDatasUsulan,
      });
    } else {
      errResponse({
        res,
        e: "Mohon hubungi kaprodi untuk membuat setting terlebih dahulu",
      });
    }
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
      include: [
        {
          model: dosen,
        },
      ],
      exclude: ["createdAt", "updatedAt", "roles"],
    });

    const getDataMhs = await readFn({
      model: mhs,
      type: "find",
      usePaginate: false,
      where: {
        no_bp,
      },
      exclude: ["password", "roles"],
      include: [
        {
          model: usulan,
          attributes: [
            "file_pra_proposal",
            "bidang",
            "jdl_from_dosen",
            "judul",
            "status_judul",
            "status_usulan",
          ],
        },
      ],
      group: ["usulans.no_bp"],
    });

    const objDatasMhs = JSON.parse(JSON.stringify(getDataMhs));

    if (Object.keys(objDatasMhs)) {
      const getDatasDosen = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
        attributes: {
          exclude: ["createdAt", "updatedAt", "roles", "password"],
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
            attributes: ["id"],
            include: [
              {
                model: mhs,
                attributes: {
                  exclude: ["password", "roles", "name"],
                },
                where: {
                  semester: objDatasMhs?.semester,
                },
              },
            ],
          },
        ],
        group: ["nip"],
      });

      const getMhsBimbingan = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
        attributes: {
          exclude: ["createdAt", "updatedAt", "roles", "password"],
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("usulans.nip")),
              "n_mhs_bimbingan",
            ],
          ],
        },
        include: [
          {
            model: usulan,
            attributes: ["id"],
          },
        ],
        group: ["nip"],
        where: {
          // "$usulans.status_judul$": { [Op.ne]: ["usulan"] },
          "$usulans.status_usulan$": "confirmed",
        },
      });

      const arrDatasUsulan = JSON.parse(JSON.stringify(getDataUsulan));
      const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
      const arrMhsBimbingan = JSON.parse(JSON.stringify(getMhsBimbingan));

      const arrDatas = [];

      arrDatasUsulan?.forEach((usul) => {
        arrDatasDosen?.forEach((dosen) => {
          if (usul?.nip === dosen?.nip) {
            arrDatas?.push(dosen);
          }
        });
      });

      const allArrDatas = [...arrDatas, ...arrMhsBimbingan];
      const objPerAllArrDatas = {};
      allArrDatas?.forEach((data) => {
        if (!objPerAllArrDatas[data?.nip]) {
          objPerAllArrDatas[data?.nip] = {
            ...data,
            n_mhs_bimbingan: 0,
          };
        }
        objPerAllArrDatas[data?.nip]["n_mhs_bimbingan"] =
          data?.n_mhs_bimbingan ||
          objPerAllArrDatas[data?.nip]?.n_mhs_bimbingan;
      });

      // ini smua dosen, biar perhitungan n_mhs_bimbingannya g keliru
      // smua dosen itu karna data dari arrMhsBimbingan
      const arrDatasWithMhsBimbingan = Object.values(objPerAllArrDatas);

      const nipUsulan = arrDatas?.map((data) => data?.nip);

      // karna smua dosen, jdi difilter lgi hanya berdasarkan nip yg di usulan seorang mhs
      const filterArrDsnBimbingan = arrDatasWithMhsBimbingan?.filter((data) =>
        nipUsulan?.includes(data?.nip)
      );

      res?.status(200)?.send({
        status: 200,
        data: {
          arrDatas: filterArrDsnBimbingan,
          statusUsulan: objDatasMhs?.usulans?.[0]?.status_usulan,
          mhs_name: objDatasMhs?.name,
          bidang: objDatasMhs?.usulans?.[0]?.bidang,
          jdl_from_dosen: objDatasMhs?.usulans?.[0]?.jdl_from_dosen,
          judul: objDatasMhs?.usulans?.[0]?.judul,
          file_pra_proposal: objDatasMhs?.usulans?.[0]?.file_pra_proposal,
        },
      });
    } else {
      res?.status(404)?.send({
        status: 404,
        error: `No. Bp ${no_bp} tidak ditemukan`,
      });
    }
    // res.status(200).send({ status: 200, message: "s" });
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

    const arrBidangs = arrDatas?.map((data) => {
      if (isStringParseArr(data?.bidang)) {
        return JSON.parse(data?.bidang || "[]");
      }
      return data?.bidang;
    });

    if (arrBidangs?.length && arrBidangs?.every((data) => data !== null)) {
      const arrNotRepeatBidangs = arrBidangs?.reduce((init, curr) => {
        init = [...new Set([...init, ...curr])];
        return init;
      }, []);

      res?.status(200)?.send({ status: 200, data: arrNotRepeatBidangs });
    } else {
      res?.status(400)?.send({
        status: 400,
        error: "Data bidang kosong, mohon tambahkan data dosen",
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getSimilaritasJudul", async (req, res) => {
  const { judul_mhs } = req.body;
  try {
    const getDataJudul = await readFn({
      model: judulData,
      type: "all",
      usePaginate: false,
      isExcludeId: false,
    });

    const getDataUsulan = await readFn({
      model: usulan,
      usePaginate: false,
      type: "all",
    });

    const getDataSetting = await readFn({
      model: setting,
      usePaginate: false,
      type: "all",
    });

    const arrDataJudul = JSON.parse(JSON.stringify(getDataJudul));
    const arrDataUsulan = JSON.parse(JSON.stringify(getDataUsulan));

    const arrDataSetting = JSON.parse(JSON.stringify(getDataSetting));

    if (arrDataSetting?.length) {
      const judulDatas = uniqueArrObj({
        arr: [...arrDataJudul, ...arrDataUsulan],
        props: "judul",
      });

      const arrWinnowing = [];
      judulDatas?.forEach((dataJudul) => {
        const JSValue = jaccardSimilarityHandler({
          strJudulMhs: judul_mhs,
          strJudulPenelitian: dataJudul?.judul,
          kGramCount: arrDataSetting?.[0]?.kGram,
          windowCount: 3,
        });

        arrWinnowing?.push({
          judul: dataJudul?.judul,
          bidang: dataJudul?.bidang,
          tingkatan: dataJudul?.tingkatan,
          skor: JSValue,
        });
      });

      res.status(200).send({
        status: 200,
        data: sortArrObj({ arr: arrWinnowing, props: "skor" }),
      });
    } else {
      errResponse({ res, e: "Mohon berikan nilai kGram di setting" });
    }

    // jaccardSimilarityHandler;
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

      const arrDatas = nip?.map((dataNip) => {
        return {
          ...req?.body,
          nip: dataNip,
          status_judul: "usulan",
          id: uuid(),
          semester: dataMhs?.semester,
          tahun: dataMhs?.tahun,
        };
      });

      await sequelize.transaction(async (transaction) => {
        await multipleFn({
          model: usulan,
          arrDatas,
          type: "add",
          isTransaction: true,
          transaction,
        });
      });
      res?.status(200)?.send({ status: 200, message: "Sukses nambah usulan" });
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
