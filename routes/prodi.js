const createFn = require("../helpers/mainFn/createFn");
const router = require("./router");
const { prodi } = require("../models");
const multipleFn = require("../helpers/mainFn/multipleFn");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");

// -CREATE-
router.post("/addProdi", async (req, res) => {
  try {
    await createFn({
      model: prodi,
      data: req.body,
    });
    res.status(200).send({ status: 200, data: "Sukses nambah prodi" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

router.post("/addMultipleDataProdi", async (req, res) => {
  const { arrDatas } = req.body;
  try {
    await multipleFn({
      model: prodi,
      arrDatas: arrDatas,
      type: "add",
    });
    res.status(200).send({ status: 200, data: "Sukses nambah prodi" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

// -UPDATE-
router.post("/updateDataProdi", async (req, res) => {
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
    res.status(400).send({ status: 400, message: e });
  }
});

router.post("/updateMultipleDataProdi", async (req, res) => {
  const { arrDatas } = req.body;
  try {
    await multipleFn({
      model: prodi,
      arrDatas,
      type: "update",
    });

    res.status(200).send({ status: 200, message: "Sukses update prodi" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

// -DELETE-
router.post("/deleteDataProdi", (req, res) => {
  const { id } = req.body;

  deleteFn({ model: prodi, where: { id } })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete prodi" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});
