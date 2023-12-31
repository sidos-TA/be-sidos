const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { forbiddenMethod, setting } = require("../models");
const errResponse = require("../helpers/errResponse");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const { uuid } = require("uuidv4");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const filterByKey = require("../helpers/filterByKey");

// -READ-
router.post("/getforbidmethods", async (req, res) => {
  const { tahun, semester } = req.body;
  try {
    const objSearchParams = filterByKey({
      req,
      arrSearchParams: ["methodName", "bidang"],
    });

    const getSettings = await readFn({
      model: setting,
    });
    const arrSetting = JSON.parse(JSON.stringify(getSettings));

    const getDataForbidMethods = await readFn({
      model: forbiddenMethod,
      type: "all",
      isExcludeId: false,
      where: {
        ...objSearchParams,
        tahun: tahun || arrSetting?.[0]?.tahun || "",
        semester: semester || arrSetting?.[0]?.semester || "",
      },
      ...(Object.keys(objSearchParams)?.length && {
        usePaginate: false,
      }),
    });
    res.status(200)?.send({ status: 200, data: getDataForbidMethods });
  } catch (e) {
    errResponse({ res, e });
  }
});
router.post("/getforbidmethodsById", async (req, res) => {
  const { id } = req.body;
  try {
    const getDataForbidMethods = await readFn({
      model: forbiddenMethod,
      type: "find",
      isExcludeId: false,
      where: {
        id,
      },
      usePaginate: false,
    });
    res.status(200)?.send({ status: 200, data: getDataForbidMethods });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE
router.post(
  "/addforbidmethods",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const getSettings = await readFn({
      model: setting,
    });

    createFn({
      model: forbiddenMethod,
      data: {
        ...req?.body,
        id: uuid(),
        semester: getSettings?.[0]?.semester || "ganjil",
      },
    })
      ?.then(() => {
        res?.status(200)?.send({
          status: 200,
          message: "Sukses nambah method yang tidak dianjurkan",
        });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

router.post(
  "/addMultipleDataForbidMethods",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;
    try {
      const getSettings = await readFn({
        model: setting,
      });
      await multipleFn({
        model: forbiddenMethod,
        arrDatas: arrDatas?.map((data) => ({
          ...data,
          id: uuid(),
          semester: getSettings?.[0]?.semester || "ganjil",
        })),
        type: "add",
      });
      res.status(200).send({
        status: 200,
        message: "Sukses nambah metode yang tidak diterima",
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -UPDATE-
router.post(
  "/updateforbidmethods",
  verifyJWT,
  forbiddenResponse,
  (req, res) => {
    const { id } = req.body;
    updateFn({ model: forbiddenMethod, data: req?.body, where: { id } })
      ?.then(() => {
        res?.status(200).send({ status: 200, message: "Sukses update data" });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);

// -DELETE-
router.post(
  "/deleteforbidmethods",
  verifyJWT,
  forbiddenResponse,
  (req, res) => {
    const { id } = req.body;
    deleteFn({ model: forbiddenMethod, where: { id } })
      ?.then(() => {
        res?.status(200)?.send({ status: 200, message: "Sukses delete prodi" });
      })
      ?.catch((e) => {
        errResponse({ res, e });
      });
  }
);
module.exports = { forbidMethodsRoute: router };
