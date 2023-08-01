const router = require("./router");
const { kategori } = require("../models");
const readFn = require("../helpers/mainFn/readFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const errResponse = require("../helpers/errResponse");

// -GET-
router.post(
  "/getAllKategori",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { page } = req.body;
    try {
      const arrDatas = await readFn({
        model: kategori,
        type: "all",
        page,
        isExcludeId: false,
        order: [["code", "ASC"]],
      });
      res?.status(200)?.send({ status: 200, data: arrDatas });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -UPDATE-
router.post("/updateKategori", verifyJWT, forbiddenResponse, (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({
    model: kategori,
    arrDatas: arrDatas?.map((data) => ({ ...data })),
    type: "update",
  })
    ?.then(() => {
      res
        ?.status(200)
        .send({ status: 200, message: "Sukses update data kategori" });
    })
    ?.catch((e) => {
      errResponse({ res, e });
    });
});

module.exports = { kategoriRoute: router };
