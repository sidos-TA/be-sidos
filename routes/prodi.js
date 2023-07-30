const createFn = require("../helpers/mainFn/createFn");
const router = require("./router");
const { prodi } = require("../models");
const multipleFn = require("../helpers/mainFn/multipleFn");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const errResponse = require("../helpers/errResponse");
const readFn = require("../helpers/mainFn/readFn");
const { uuid } = require("uuidv4");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");

// -READ-
router.post("/getAllProdi", verifyJWT, forbiddenResponse, async (req, res) => {
  try {
    const arrDatasProdi = await readFn({
      model: prodi,
      type: "all",
    });
    res?.status(200)?.send({ status: 200, data: arrDatasProdi });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE-
router.post("/addProdi", verifyJWT, forbiddenResponse, async (req, res) => {
  try {
    await createFn({
      model: prodi,
      data: req.body,
    });
    res.status(200).send({ status: 200, data: "Sukses nambah prodi" });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/addMultipleDataProdi",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;
    try {
      await multipleFn({
        model: prodi,
        arrDatas: arrDatas?.map((data) => ({ ...data, id: uuid() })),
        type: "add",
      });
      res.status(200).send({ status: 200, data: "Sukses nambah prodi" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -UPDATE-
router.post(
  "/updateDataProdi",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { id } = req.body;
    try {
      await updateFn({
        model: prodi,
        data: req.body,
        where: {
          id,
        },
      });

      res.status(200).send({ status: 200, message: "Sukses update prodi" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post(
  "/updateMultipleDataProdi",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;
    try {
      await multipleFn({
        model: prodi,
        arrDatas,
        type: "update",
      });

      res.status(200).send({ status: 200, message: "Sukses update prodi" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -DELETE-
router.post("/deleteDataProdi", verifyJWT, forbiddenResponse, (req, res) => {
  const { id } = req.body;

  deleteFn({ model: prodi, where: { id } })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete prodi" });
    })
    ?.catch((e) => {
      errResponse({ res, e });
    });
});

module.exports = { prodiRoute: router };
