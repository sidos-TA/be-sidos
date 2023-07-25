const createFn = require("../helpers/mainFn/createFn");
const router = require("./router");
const { judulData } = require("../models");
const multipleFn = require("../helpers/mainFn/multipleFn");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const filterByKey = require("../helpers/filterByKey");
const readFn = require("../helpers/mainFn/readFn");
const errResponse = require("../helpers/errResponse");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");

// -READ-
router.post("/getJudul", async (req, res) => {
  try {
    const objSearch = filterByKey({ req });
    const arrDatasJudul = await readFn({
      model: judulData,
      type: "all",
      where: objSearch,
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),
    });

    res?.status(200)?.send({ status: 200, data: arrDatasJudul });
  } catch (e) {
    errResponse({ e, res });
  }
});
// -CREATE-
router.post("/addJudul", verifyJWT, forbiddenResponse, async (req, res) => {
  try {
    await createFn({
      model: judulData,
      data: req.body,
    });
    res.status(200).send({ status: 200, data: "Sukses nambah judul" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

router.post(
  "/addMultipleDataJudul",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;
    try {
      await multipleFn({
        model: judulData,
        arrDatas: arrDatas,
        type: "add",
      });
      res.status(200).send({ status: 200, data: "Sukses nambah judul" });
    } catch (e) {
      res.status(400).send({ status: 400, message: e });
    }
  }
);

// -UPDATE-
router.post(
  "/updateDataJudul",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { id } = req.body;
    try {
      await updateFn({
        model: judulData,
        data: req.body,
        where: {
          id,
        },
      });

      res.status(200).send({ status: 200, message: "Sukses update data" });
    } catch (e) {
      res.status(400).send({ status: 400, message: e });
    }
  }
);

router.post(
  "/updateMultipleDataJudul",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;
    try {
      await multipleFn({
        model: judulData,
        arrDatas,
        type: "update",
      });

      res.status(200).send({ status: 200, message: "Sukses update data" });
    } catch (e) {
      res.status(400).send({ status: 400, message: e });
    }
  }
);

// -DELETE-
router.post("/deleteDataJudul", verifyJWT, forbiddenResponse, (req, res) => {
  const { id } = req.body;

  deleteFn({ model: judulData, where: { id } })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

module.exports = { judulDataRoute: router };
