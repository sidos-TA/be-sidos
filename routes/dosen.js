const scrapeGS = require("../controller/dsn/read/scrapeGS");
const scrapeSIPEG = require("../controller/dsn/read/scrapeSIPEG");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const { dosen } = require("../models");
const router = require("./router");

// -READ-
router.post("/getAllDosen", async (req, res) => {
  const { page } = req.body;
  try {
    const arrDatas = await readFn({
      model: dosen,
      type: "all",
      page,
    });
    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send({ status: 400, data: [], message: e?.message });
  }
});

router.post("/getDosenByNIP", async (req, res) => {
  const { nip } = req.body;
  try {
    // const arrDatas = await getDsnByUID(id_dosen);
    const arrDatas = await readFn({
      model: dosen,
      type: "find",
      where: {
        nip,
      },
    });
    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send({ status: 400, message: e?.message });
  }
});

router.post("/scrapeGS", async (req, res) => {
  const { gs_url } = req.body;
  try {
    const { dataPenelitian, bidang } = await scrapeGS(gs_url);
    res.status(200).send({ status: 200, penelitian: dataPenelitian, bidang });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
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
      res?.status(400)?.send(e);
    });
});

router.post("/addMultipleDataDosen", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({ model: dosen, arrDatas, type: "add" })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    ?.catch((e) => {
      res?.status(400).send({ message: e?.message });
    });
});

// -UPDATE-
router.post("/updateDataDosen", (req, res) => {
  const { nip } = req.body;

  updateFn({ model: dosen, data: req?.body, where: { nip } })
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
  const { nip } = req.body;

  deleteFn({ model: dosen, where: { nip } })
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
