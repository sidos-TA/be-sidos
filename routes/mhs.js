const decodeJWT = require("../helpers/decodeJWT");
const encryptPassword = require("../helpers/encryptPassword");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const readFn = require("../helpers/mainFn/readFn");
const updateFn = require("../helpers/mainFn/updateFn");
const verifyJWT = require("../helpers/verifyJWT");
const { mhs, bimbingan, dosen } = require("../models");
const router = require("./router");

// -GET-
router.post("/getAllMhs", verifyJWT, forbiddenResponse, async (req, res) => {
  const { page } = req.body;

  try {
    const objSearch = filterByKey({ req });
    const arrDatas = await readFn({
      model: mhs,
      type: "all",
      page,
      where: objSearch,
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),
    });
    const arrColumns = Object.keys(mhs?.rawAttributes);

    res.status(200).send({ status: 200, data: arrDatas, columns: arrColumns });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/getMhsByNoBp", verifyJWT, async (req, res) => {
  const { no_bp } = req.body;
  try {
    const getDatasMhs = await readFn({
      model: mhs,
      type: "find",
      where: {
        no_bp,
      },
      usePaginate: false,
    });
    const getDataBimbinganByKey = await readFn({
      model: bimbingan,
      type: "all",
      where: {
        no_bp,
      },
      include: [dosen],
    });

    const arrDatasDospem = JSON.parse(
      JSON.stringify(getDataBimbinganByKey)
    )?.map((data) => data?.dosen);
    const datasMhs = JSON.parse(JSON.stringify(getDatasMhs));

    res.send({
      status: 200,
      data: { ...datasMhs, dosPem: arrDatasDospem },
    });
  } catch (e) {
    res.send(e);
  }
});

// -CREATE-
router.post("/addMhs", verifyJWT, forbiddenResponse, async (req, res) => {
  const dataJWT = decodeJWT({ req });
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  createFn({
    model: mhs,
    data: { ...req?.body, password: hashPassword },
  })
    ?.then(() => {
      if (dataJWT?.roles === 1) {
        res?.status(200).send({ status: 200, message: "Sukses nambah data" });
      } else {
        forbiddenResponse({ res });
      }
    })
    .catch((e) => {
      errResponse({ res, e });
    });
});

router.post("/addMultipleDataMhs", verifyJWT, (req, res) => {
  const { arrDatas } = req.body;
  const dataJWT = decodeJWT({ req });

  multipleFn({ model: mhs, arrDatas, type: "add" })
    ?.then(() => {
      if (dataJWT?.roles === 1) {
        res?.status(200).send({ status: 200, message: "Sukses nambah data" });
      } else {
        forbiddenResponse({ res });
      }
    })
    ?.catch((e) => {
      errResponse({ res, e });
    });
});

// -UPDATE-
router.post("/updateDataMhs", verifyJWT, (req, res) => {
  const { no_bp } = req.body;

  updateFn({ model: mhs, data: req?.body, where: { no_bp } })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses update data" });
    })
    ?.catch((e) => {
      res?.status(400).send(e);
    });
});

router.post(
  "/updateMultipleDataMhs",
  verifyJWT,
  forbiddenResponse,
  (req, res) => {
    const { arrDatas } = req.body;

    multipleFn({ model: mhs, arrDatas, type: "update" })
      ?.then(() => {
        res?.status(200).send({ status: 200, message: "Sukses update data" });
      })
      ?.catch((e) => {
        res?.status(400).send(e);
      });
  }
);

// -DELETE-
router.post("/deleteDataMhs", verifyJWT, (req, res) => {
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
