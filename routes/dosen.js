const { Op } = require("sequelize");
const { uuid } = require("uuidv4");
const addBidang = require("../controller/bidang/addBidang");
const scrapeGS = require("../controller/dsn/read/scrapeGS");
const scrapeSINTA = require("../controller/dsn/read/scrapeSINTA");
const scrapeSIPEG = require("../controller/dsn/read/scrapeSIPEG");
const addPenelitian = require("../controller/penelitian/addPenelitian");
const allowHelp = require("../helpers/allowHelp");
const encryptPassword = require("../helpers/encryptPassword");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const { uniqueArrObj } = require("../helpers/uniqueArr_ArrObj");
const verifyJWT = require("../helpers/verifyJWT");
const {
  dosen,
  usulan,
  mhs,
  setting,
  penelitian,
  bidang,
  sequelize,
} = require("../models");
const router = require("./router");

// -READ-
router.post("/getAllDosen", verifyJWT, async (req, res) => {
  const { page, showRoles = false, semester, tahun } = req.body;
  try {
    const getSetting = await readFn({
      model: setting,
    });
    const arrSetting = JSON.parse(JSON.stringify(getSetting));

    const objSearchDosen = filterByKey({
      req,
      arrSearchParams: ["name", "jabatan", "pendidikan"],
    });

    const showRolesAttr = showRoles
      ? ["name", "nip", "sks", "jabatan", "pendidikan", "roles"]
      : ["name", "nip", "sks", "jabatan", "pendidikan"];

    const mhsObjModel = {
      model: mhs,
      attributes: ["semester", "tahun"],
      where: {
        semester: semester || arrSetting?.[0]?.semester || "",
        tahun: tahun || arrSetting?.[0]?.tahun || "",
      },
    };

    const getDatas = await readFn({
      model: dosen,
      type: "all",
      page,
      usePaginate: false,
      attributes: showRolesAttr,
      where: objSearchDosen,
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

    const arrDatas = JSON.parse(JSON.stringify(getDatas));
    const arrUsulanMhsUsul = JSON.parse(JSON.stringify(getUsulanMhsUsul));
    const arrUsulanMhsBimbing = JSON.parse(JSON.stringify(getUsulanMhsBimbing));

    const allData = [...arrDatas, ...arrUsulanMhsUsul, ...arrUsulanMhsBimbing];

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

    res.status(200).send({
      status: 200,
      data: result,
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/getDosenByNIP",
  verifyJWT,
  // forbiddenResponse,
  allowHelp,
  async (req, res) => {
    const { nip, semester, tahun } = req.body;

    try {
      const getSetting = await readFn({
        model: setting,
      });
      const arrSetting = JSON.parse(JSON.stringify(getSetting));
      const getDatasDosen = await readFn({
        model: dosen,
        type: "find",
        where: {
          nip,
        },
        exclude: ["password", "roles"],
        include: [
          {
            model: penelitian,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: bidang,
            attributes: ["bidang"],
          },
        ],
      });

      const getDatasUsulan = await readFn({
        model: usulan,
        include: {
          model: mhs,
          attributes: ["semester", "tahun", "photo", "name", "prodi"],
        },
        where: {
          status_usulan: "confirmed",
          semester: semester || arrSetting?.[0]?.semester || "",
          tahun: tahun || arrSetting?.[0]?.tahun || "",
          nip,
        },
      });

      const objDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
      const arrDatasUsulan = JSON.parse(JSON.stringify(getDatasUsulan));

      objDatasDosen["usulans"] = arrDatasUsulan;

      if (Object.keys(objDatasDosen || {})?.length) {
        res.status(200).send({ status: 200, data: objDatasDosen });
      } else {
        errResponse({ res, e: "Data dosen tidak tersedia", status: 400 });
      }
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post("/scrapeSINTA", async (req, res) => {
  const { link, nip, oldArrDatas = [] } = req.body;

  try {
    const dataGSSINTA = await scrapeSINTA(link);

    const resultData = {
      penelitian: dataGSSINTA?.dataPenelitian,
      bidang: dataGSSINTA?.bidang,
    };

    /**
     * 1. Hapus semua data penelitian/bidang, baik datany udh ada/blum
     * 2. Tambahkan data yg baru
     */
    if (link?.includes("sinta.kemdikbud.go.id/authors/profile")) {
      // kalau udah ada, bakal diedit
      if (nip && oldArrDatas?.length) {
        const uniqueNewArrPenelitian = uniqueArrObj({
          arr: [...resultData.penelitian, ...oldArrDatas],
          props: "judulPenelitian",
        });

        addPenelitian({
          arrDatas: uniqueNewArrPenelitian.map((data) => ({
            ...data,
            nip,
          })),
          where: {
            nip,
          },
        });
      }
      res.status(200).send({ status: 200, data: resultData });
    } else {
      errResponse({
        res,
        e: "Link SINTA tidak sesuai, mohon masukkan sesuai format seperti https://sinta.kemdikbud.go.id/authors/profile/5979627",
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/scrapeGS",
  verifyJWT,
  //  forbiddenResponse,
  allowHelp,
  async (req, res) => {
    const { link, nip, oldArrDatas = [] } = req.body;

    try {
      if (
        (link &&
          link?.includes("https://scholar.google.co.id/citations?user")) ||
        link?.includes("https://scholar.google.com/citations?user")
      ) {
        const { dataPenelitian, bidang } = await scrapeGS(link);
        const resultData = {
          penelitian: dataPenelitian,
          bidang,
        };

        if (nip && oldArrDatas?.length) {
          const uniqueNewArrPenelitian = uniqueArrObj({
            arr: [...dataPenelitian, ...oldArrDatas],
            props: "judulPenelitian",
          });

          addPenelitian({
            arrDatas: uniqueNewArrPenelitian?.map((data) => ({
              ...data,
              nip,
            })),
            where: {
              nip,
            },
          });
        }
        res.status(200).send({ status: 200, data: resultData });
      } else {
        throw new Error("Mohon masukkan link google schoolar");
      }
    } catch (e) {
      errResponse({ res, e: "Link google scholar tidak sesuai" });
    }
  }
);

router.post(
  "/scrapeSIPEG",
  verifyJWT,
  //  forbiddenResponse
  allowHelp,
  async (req, res) => {
    const { nip } = req.body;

    try {
      if (nip) {
        const { name, jabatan, pendidikan } = await scrapeSIPEG(nip);

        const resultData = {
          name,
          jabatan,
          pendidikan,
        };

        res.status(200).send({ status: 200, data: resultData });
      } else {
        throw new Error("Mohon Masukkan NIP");
      }
    } catch (e) {
      errResponse({ res, e: "NIP tidak ditemukan" });
    }
  }
);

router.post(
  "/getSourcePenelitian",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { nip } = req.body;
    try {
      const getDataPenelitian = await readFn({
        model: dosen,
        where: {
          nip,
        },
        type: "find",
        attributes: ["linkDataPenelitian"],
      });

      res.status(200)?.send({ status: 200, data: getDataPenelitian });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -CREATE-
/**Ini hanya utk pribadi */
router.post("/addDataDosen_private", async (req, res) => {
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  const dataDosen = {
    ...req.body,
  };

  const penelitianReqData = req.body.penelitian || [];
  const bidangReqData = req.body.bidang || [];

  delete dataDosen["penelitian"];
  delete dataDosen["bidang"];

  try {
    dosen.addHook("afterCreate", async (_, options) => {
      if (penelitianReqData?.length) {
        await multipleFn({
          model: penelitian,
          arrDatas: penelitianReqData?.map((data) => ({
            ...data,
            nip: req.body?.nip,
          })),
          transaction: options?.transaction,
        });
      }

      if (bidangReqData?.length) {
        await multipleFn({
          model: bidang,
          arrDatas: bidangReqData?.map((data) => ({
            ...data,
            nip: req.body?.nip,
          })),
          transaction: options?.transaction,
        });
      }
    });

    await sequelize.transaction(async (transaction) => {
      await createFn({
        data: { ...req?.body, password: hashPassword, id: uuid() },
        model: dosen,
        transaction,
      });
    });
    res
      ?.status(200)
      ?.send({ status: 200, message: "Sukses nambah data dosen" });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/addDataDosen",
  verifyJWT,
  // forbiddenResponse,
  allowHelp,
  async (req, res) => {
    const hashPassword = await encryptPassword(
      req?.body?.password || "password123"
    );

    const dataDosen = {
      ...req.body,
    };

    const penelitianReqData = req.body.penelitian?.map((data) => ({
      ...data,
      nip: req.body.nip,
    }));
    const bidangReqData = req.body.bidang?.map((data) => ({
      ...data,
      nip: req.body.nip,
      bidang: data,
    }));

    delete dataDosen["penelitian"];
    delete dataDosen["bidang"];

    try {
      dosen.addHook("afterCreate", async (_, options) => {
        await multipleFn({
          model: penelitian,
          arrDatas: penelitianReqData,
          transaction: options?.transaction,
        });

        await multipleFn({
          model: bidang,
          arrDatas: bidangReqData,
          transaction: options?.transaction,
        });
      });

      await sequelize.transaction(async (transaction) => {
        await createFn({
          data: { ...req?.body, password: hashPassword, id: uuid() },
          model: dosen,
          transaction,
        });
      });
      res
        ?.status(200)
        ?.send({ status: 200, message: "Sukses nambah data dosen" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post(
  "/addMultipleDataDosen",
  verifyJWT,
  forbiddenResponse,
  (req, res) => {
    const { arrDatas } = req.body;

    multipleFn({
      model: dosen,
      arrDatas: arrDatas?.map((data) => {
        // const hashedPassword = await encryptPassword(
        //   data?.password || "password123"
        // );
        return {
          ...data,
          password: "password123",
        };
      }),
      type: "add",
    })
      ?.then(() => {
        res?.status(200).send({ status: 200, message: "Sukses nambah data" });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

// -UPDATE-
router.post(
  "/updateDataDosen",
  verifyJWT,
  // forbiddenResponse,
  allowHelp,
  (req, res) => {
    const { nip } = req.body;

    const arrBidang = req.body.bidang || [];

    delete req.body["bidang"];
    delete req.body["photo"];

    updateFn({ model: dosen, data: req?.body, where: { nip } })
      ?.then(async () => {
        if (arrBidang?.length) {
          addBidang({
            arrDatas: arrBidang?.map((data) => ({
              ...data,
              nip,
            })),
            where: {
              nip,
            },
          });
        }

        const getNewDatasDosen = await readFn({
          model: dosen,
          type: "find",
          where: {
            nip,
          },
          usePaginate: false,
          attributes: ["jabatan"],
        });
        res?.status(200).send({
          status: 200,
          message: "Sukses update data",
          data: getNewDatasDosen,
        });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

router.post(
  "/updateMultipleDataDosen",
  verifyJWT,
  forbiddenResponse,
  (req, res) => {
    const { arrDatas } = req.body;

    multipleFn({ model: dosen, arrDatas, type: "update" })
      ?.then(() => {
        res?.status(200).send({ status: 200, message: "Sukses update data" });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

router.post(
  "/updateSourcePenelitian",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { source_link, nip } = req.body;
    try {
      updateFn({
        model: dosen,
        data: {
          linkDataPenelitian: source_link,
        },
        where: {
          nip,
        },
      })
        ?.then(() => {
          res
            .status(200)
            ?.send({ status: 200, message: "Sukses update link penelitian" });
        })
        ?.catch((e) => {
          errResponse({ e, res });
        });
    } catch (e) {
      errResponse({ e, res });
    }
  }
);

// -DELETE-
router.post(
  "/deleteDataDosen",
  verifyJWT,
  //  forbiddenResponse,
  allowHelp,
  (req, res) => {
    const { nip } = req.body;

    deleteFn({ model: dosen, where: { nip } })
      ?.then(() => {
        res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

module.exports = {
  dsnRoute: router,
};
