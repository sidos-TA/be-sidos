const formatResponseSameKey = require("../controller/bimbingan/formatResponseSameKey");
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
const { dosen, bimbingan, mhs, usulan } = require("../models");
const router = require("./router");

// -READ-
router.post("/getAllDosen", verifyJWT, async (req, res) => {
  const { page } = req.body;
  try {
    const objSearch = filterByKey({ req });
    const getDatas = await readFn({
      model: dosen,
      type: "all",
      page,
      where: objSearch,
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),

      include: [usulan, bimbingan],
    });

    const arrDatasDosen = JSON.parse(JSON.stringify(getDatas));

    res.status(200).send({ status: 200, data: arrDatasDosen });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/getDosenByNIP",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { nip } = req.body;

    try {
      const getDatasDosen = await readFn({
        model: dosen,
        type: "find",
        where: {
          nip,
        },
      });
      const getDatasBimbingan = await readFn({
        model: bimbingan,
        type: "all",
        where: {
          nip,
        },
        include: [mhs],
      });
      const objDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
      const arrDatasBimbingan = JSON.parse(JSON.stringify(getDatasBimbingan));

      const [dataMhsBimbingan] = formatResponseSameKey({
        arrDatas: arrDatasBimbingan,
        propsKey: "nip",
        propsMergeToArray: "mh",
      });

      const dataDosen = { ...objDatasDosen, ...dataMhsBimbingan };

      res.status(200).send({ status: 200, data: dataDosen });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post("/scrapeSINTA", async (req, res) => {
  const { sinta_id } = req.body;

  try {
    const dataScopus = await scrapeSINTA(sinta_id, "scopus");
    const dataWOS = await scrapeSINTA(sinta_id, "wos");
    const dataGaruda = await scrapeSINTA(sinta_id, "garuda");
    const dataGS = await scrapeSINTA(sinta_id, "googlescholar");
    const dataRAMA = await scrapeSINTA(sinta_id, "rama");

    const data = [dataScopus, dataWOS, dataGaruda, dataGS, dataRAMA];
    // const redData = data?.reduce((init, curr) => {
    //   init = [...curr.dataPenelitian];
    //   return init;
    // }, []);

    res.status(200).send({ status: 200, data });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/scrapeGS", verifyJWT, forbiddenResponse, async (req, res) => {
  const { gs_url } = req.body;

  try {
    if (
      (gs_url &&
        gs_url?.includes("https://scholar.google.co.id/citations?user")) ||
      gs_url?.includes("https://scholar.google.com/citations?user")
    ) {
      const { dataPenelitian, bidang } = await scrapeGS(gs_url);
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
router.post("/addDataDosen", verifyJWT, forbiddenResponse, async (req, res) => {
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  createFn({ data: { ...req?.body, password: hashPassword }, model: dosen })
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
