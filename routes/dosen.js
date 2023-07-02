const express = require("express");
const scrapeGS = require("../controller/dsn/read/scrapeGS");
const scrapeSIPEG = require("../controller/dsn/read/scrapeSIPEG");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");

const { dosen } = require("../models");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// -READ-
router.get("/getAllDosen", async (req, res) => {
  try {
    const arrDatas = await readFn({
      model: dosen,
      type: "all",
    });
    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(404).send({ status: 404, data: [], message: e?.message });
  }
});

router.post("/getDosenById", async (req, res) => {
  const { id_dosen } = req.body;
  try {
    // const arrDatas = await getDsnByUID(id_dosen);
    const arrDatas = await readFn({
      model: dosen,
      type: "find",
      key: "id_dosen",
      val: id_dosen,
    });
    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/scrapeGS", async (req, res) => {
  const { gs_url } = req.body;
  try {
    const { dataPenelitian, bidang } = await scrapeGS(gs_url);
    res.status(200).send({ status: 200, penelitian: dataPenelitian, bidang });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/scrapeSIPEG", async (req, res) => {
  const { nip } = req.body;
  try {
    const { name, jabatan, pendidikan } = await scrapeSIPEG(nip);
    res.status(200).send({ status: 200, name, nip, jabatan, pendidikan });
  } catch (e) {
    res.send(e);
  }
});

// -CREATE-
router.post("/addDataDosen", (req, res) => {
  createFn({ data: req?.body, model: dosen })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    .catch((e) => {
      res?.status(400).send(e);
    });
});

router.post("/addMultipleDataDosen", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({ model: dosen, arrDatas, type: "add" })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

// -UPDATE-
router.post("/updateDataDosen", (req, res) => {
  const { id_dosen } = req.body;

  updateFn({ model: dosen, data: req?.body, key: "id_dosen", val: id_dosen })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

router.post("/updateMultipleDataDosen", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({ model: dosen, arrDatas, type: "update" })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

// -DELETE-
router.post("/deleteDataDosen", (req, res) => {
  const { id_dosen } = req.body;

  deleteFn({ model: dosen, key: "id_dosen", val: id_dosen })
    ?.then(() => {
      res?.status(200)?.send({ status: 200, message: "Sukses delete data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

module.exports = {
  dsnRoute: router,
};
