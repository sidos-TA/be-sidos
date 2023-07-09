const router = require("./router");
const { kategori } = require("../models");
const readFn = require("../helpers/mainFn/readFn");
const multipleFn = require("../helpers/mainFn/multipleFn");

// -GET-
router.post("/getAllKategori", async (req, res) => {
  const { page } = req.body;
  try {
    const arrDatas = await readFn({
      model: kategori,
      type: "all",
      page,
      isExcludeId: false,
    });
    res?.status(200)?.send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send({ status: 400, data: [], message: e?.message });
  }
});

// -UPDATE-
router.post("/updateKategori", (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({
    model: kategori,
    arrDatas,
    type: "update",
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400)?.send(e);
    });
});

module.exports = { kategoriRoute: router };
