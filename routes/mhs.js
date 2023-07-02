const express = require("express");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const { mhs } = require("../models");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// -GET-
router.get("/getAllMhs", async (req, res) => {
  try {
    const arrDatas = await readFn({ model: mhs, type: "all" });
    res.send({ status: 200, data: arrDatas });
  } catch (e) {
    res.send(e);
  }
});
router.post("/getMhsById", async (req, res) => {
  const { id_mhs } = req.body;
  try {
    const arrDatas = await readFn({
      model: mhs,
      type: "find",
      key: "id_mhs",
      val: id_mhs,
    });
    res.send({ status: 200, data: arrDatas });
  } catch (e) {
    res.send(e);
  }
});

// -CREATE-
router.post("/addMhs", (req, res) => {
  createFn({
    model: mhs,
    data: req?.body,
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    .catch((e) => {
      res?.status(400).send(e);
    });
});

router.post("/addMultipleDataMhs", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({ model: mhs, arrDatas, type: "add" })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

// -UPDATE-
router.post("/updateDataMhs", (req, res) => {
  const { id_mhs } = req.body;

  updateFn({ model: mhs, data: req?.body, key: "id_mhs", val: id_mhs })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

router.post("/updateMultipleDataMhs", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({ model: mhs, arrDatas, type: "update" })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

// -DELETE-
router.post("/deleteDataMhs", (req, res) => {
  const { id_mhs } = req.body;

  deleteFn({ model: mhs, key: "id_mhs", val: id_mhs })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

module.exports = {
  mhsRoute: router,
};
