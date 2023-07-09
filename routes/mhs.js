const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const { mhs } = require("../models");
const router = require("./router");

// -GET-
router.post("/getAllMhs", async (req, res) => {
  const { page } = req.body;
  try {
    const arrDatas = await readFn({
      model: mhs,
      type: "all",
      page,
    });
    res.send({ status: 200, data: arrDatas });
  } catch (e) {
    res.send(e);
  }
});
router.post("/getMhsById", async (req, res) => {
  const { no_bp } = req.body;
  try {
    const arrDatas = await readFn({
      model: mhs,
      type: "find",
      where: {
        no_bp,
      },
      usePaginate: false,
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
  const { no_bp } = req.body;

  updateFn({ model: mhs, data: req?.body, where: { no_bp } })
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
  const { no_bp } = req.body;

  deleteFn({ model: mhs, where: { no_bp } })
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
