const createFn = require("../helpers/mainFn/createFn");
const router = require("./router");
const { judulData } = require("../models");
const multipleFn = require("../helpers/mainFn/multipleFn");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");

// -CREATE-
router.post("/addJudul", async (req, res) => {
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

router.post("/addMultipleDataJudul", async (req, res) => {
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
});

// -UPDATE-
router.post("/updateDataJudul", async (req, res) => {
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
});

router.post("/updateMultipleDataJudul", async (req, res) => {
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
});

// -DELETE-
router.post("/deleteDataJudul", (req, res) => {
  const { id } = req.body;

  deleteFn({ model: judulData, where: { id } })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});
