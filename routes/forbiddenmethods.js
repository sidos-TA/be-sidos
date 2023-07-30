const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { forbiddenMethod } = require("../models");
const errResponse = require("../helpers/errResponse");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const { uuid } = require("uuidv4");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");

// -READ-
router.post("/getforbidmethods", async (req, res) => {
  try {
    const getDataForbidMethods = await readFn({
      model: forbiddenMethod,
      type: "all",
    });
    res.status(200)?.send({ status: 200, data: getDataForbidMethods });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE
router.post("/addforbidmethods", verifyJWT, forbiddenResponse, (req, res) => {
  createFn({
    model: forbiddenMethod,
    data: { ...req?.body, id: uuid() },
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
});

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
