const errResponse = require("../helpers/errResponse");
const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { penelitian, dosen } = require("../models");
const deleteFn = require("../helpers/mainFn/deleteFn");
const scrapeSINTA = require("../controller/dsn/read/scrapeSINTA");
const scrapeGS = require("../controller/dsn/read/scrapeGS");
const rescrapePenelitian = require("../controller/penelitian/rescrapeHandler");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const updateFn = require("../helpers/mainFn/updateFn");
const createFn = require("../helpers/mainFn/createFn");
const filterByKey = require("../helpers/filterByKey");

// -CREATE-
router.post("/addPenelitian", async (req, res) => {
  try {
    createFn({
      model: penelitian,
      data: req.body,
    })?.then(async () => {
      const getDatasPenelitian = await readFn({
        model: penelitian,
        isExcludeId: false,
        exclude: ["createdAt", "updatedAt"],
        where: {
          nip: req.body.nip,
        },
        usePaginate: false,
      });

      res.status(200)?.send({
        status: 200,
        message: "Sukses nambah data penelitian",
        data: getDatasPenelitian,
      });
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -READ-
router.post("/getPenelitian", async (req, res) => {
  try {
    const objSearchPenelitian = filterByKey({
      req,
      arrSearchParams: ["judulPenelitian"],
    });

    const getDatasPenelitian = await readFn({
      model: penelitian,
      type: "all",
      include: [
        {
          model: dosen,
          attributes: ["name", "nip"],
        },
      ],
      where: {
        ...objSearchPenelitian,
      },
      ...(Object.keys(objSearchPenelitian)?.length && {
        usePaginate: false,
      }),
      order: [["createdAt", "DESC"]],
    });

    const arrDatasPenelitian = JSON.parse(JSON.stringify(getDatasPenelitian));

    res.status(200).send({ status: 200, data: arrDatasPenelitian });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getPenelitianById", async (req, res) => {
  const { id, nip } = req.body;
  try {
    const getDatasPenelitian = await readFn({
      model: penelitian,
      type: "find",
      where: {
        nip,
        id,
      },
      usePaginate: false,
      isExcludeId: false,
    });

    res.status(200)?.send({ status: 200, data: getDatasPenelitian });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -UPDATE-
router.post(
  "/rescrapePenelitian",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { endpointScrape, link, oldArrPenelitian = [], nip } = req.body;
    try {
      if (endpointScrape === "scrapeSINTA") {
        const { dataPenelitian } = await scrapeSINTA(link);
        await rescrapePenelitian({
          nip,
          res,
          oldArrPenelitian,
          newArrPenelitian: dataPenelitian,
        });
      } else if (endpointScrape === "scrapeGS") {
        const { dataPenelitian } = await scrapeGS(link);

        await rescrapePenelitian({
          nip,
          res,
          oldArrPenelitian,
          newArrPenelitian: dataPenelitian,
        });
      } else {
        errResponse({
          res,
          e: "Link yang dimasukkan bukan google scholar maupun sinta.kemendikbud",
        });
      }
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post("/editPenelitian", async (req, res) => {
  const { id, nip } = req.body;
  try {
    updateFn({
      model: penelitian,
      where: {
        nip,
        id,
      },
      data: req.body,
    })?.then(async () => {
      const getDatasPenelitian = await readFn({
        model: penelitian,
        where: {
          nip,
        },
        isExcludeId: false,
        usePaginate: false,
        exclude: ["createdAt", "updatedAt"],
      });

      const arrDatasPenelitian = JSON.parse(JSON.stringify(getDatasPenelitian));

      res.status(200).send({
        status: 200,
        data: arrDatasPenelitian,
        message: "Berhasil edit",
      });
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -DELETE-
router.post(
  "/deletePenelitianById",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { id, nip } = req.body;
    try {
      await deleteFn({
        model: penelitian,
        where: {
          id,
          nip,
        },
      });

      const getDatasPenelitian = await readFn({
        model: penelitian,
        where: {
          nip,
        },
        isExcludeId: false,
        usePaginate: false,
        exclude: ["createdAt", "updatedAt"],
      });
      res.status(200)?.send({
        status: 200,
        message: "Berhasil hapus penelitian",
        data: getDatasPenelitian,
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

module.exports = { penelitianRoute: router };
