const { uuid } = require("uuidv4");
const scrapeGS = require("../controller/dsn/read/scrapeGS");
const scrapeSINTA = require("../controller/dsn/read/scrapeSINTA");
const scrapeSIPEG = require("../controller/dsn/read/scrapeSIPEG");
const encryptPassword = require("../helpers/encryptPassword");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const verifyJWT = require("../helpers/verifyJWT");
const { dosen, usulan, mhs, setting } = require("../models");
const router = require("./router");

// -READ-
router.post("/getAllDosen", verifyJWT, async (req, res) => {
  const {
    page,
    usePaginate = true,
    showRoles = false,
    semester,
    tahun,
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
      usePaginate,
      where: objSearch,
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),
      attributes: showRolesAttr,
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
  forbiddenResponse,
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
            model: usulan,
            include: {
              model: mhs,
              attributes: ["semester", "tahun", "photo", "name", "prodi"],
              where: {
                semester: semester || arrSetting?.[0]?.semester || "",
                tahun: tahun || arrSetting?.[0]?.tahun || "",
              },
            },
            attributes: ["nip", "judul"],
          },
        ],
      });

      const objDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));

      if (Object.keys(objDatasDosen || {})?.length) {
        res.status(200).send({ status: 200, data: objDatasDosen });
      } else {
        errResponse({ res, e: "Data dosen tidak tersedia", status: 404 });
      }
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post("/scrapeSINTA", async (req, res) => {
  const { link } = req.body;

  try {
    const dataGSSINTA = await scrapeSINTA(link);

    const resultData = {
      penelitian: dataGSSINTA?.dataPenelitian,
      bidang: dataGSSINTA?.bidang,
    };

    res.status(200).send({ status: 200, data: resultData });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/scrapeGS", verifyJWT, forbiddenResponse, async (req, res) => {
  const { link } = req.body;

  try {
    if (
      (link && link?.includes("https://scholar.google.co.id/citations?user")) ||
      link?.includes("https://scholar.google.com/citations?user")
    ) {
      const { dataPenelitian, bidang } = await scrapeGS(link);
      const resultData = {
        penelitian: dataPenelitian,
        bidang,
      };

      res.status(200).send({ status: 200, data: resultData });
    } else {
      throw new Error("Mohon masukkan link google schoolar");
    }
  } catch (e) {
    errResponse({ res, e: "Link google scholar tidak sesuai" });
  }
});

router.post("/scrapeSIPEG", verifyJWT, forbiddenResponse, async (req, res) => {
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
});

// -CREATE-
/**Ini hanya utk pribadi */
router.post("/addDataDosen_private", async (req, res) => {
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  createFn({
    data: { ...req?.body, password: hashPassword, id: uuid() },
    model: dosen,
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    .catch((e) => {
      errResponse({ res, e });
    });
});

router.post("/addDataDosen", verifyJWT, forbiddenResponse, async (req, res) => {
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  createFn({
    data: { ...req?.body, password: hashPassword, id: uuid() },
    model: dosen,
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    .catch((e) => {
      errResponse({ res, e });
    });
});

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
router.post("/updateDataDosen", verifyJWT, forbiddenResponse, (req, res) => {
  const { nip } = req.body;

  updateFn({ model: dosen, data: req?.body, where: { nip } })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      errResponse({ res, e });
    });
});

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

// -DELETE-
router.post("/deleteDataDosen", verifyJWT, forbiddenResponse, (req, res) => {
  const { nip } = req.body;

  deleteFn({ model: dosen, where: { nip } })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
    })
    ?.catch((e) => {
      errResponse({ res, e });
    });
});

module.exports = {
  dsnRoute: router,
};
