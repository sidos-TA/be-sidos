const yearNow = require("../constants/yearNow");
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
const { mhs, dosen, usulan, setting } = require("../models");
const router = require("./router");

// -GET-
router.post("/getAllMhs", verifyJWT, forbiddenResponse, async (req, res) => {
  const { page, semester, tahun = yearNow } = req.body;

  try {
    const getDataSettings = await readFn({
      model: setting,
      type: "all",
    });

    const objSearch = filterByKey({ req });
    const arrDatas = await readFn({
      model: mhs,
      type: "all",
      page,
      where: {
        tahun,
        semester: semester || getDataSettings?.[0]?.semester,
        ...objSearch,
      },
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),
      include: [
        {
          model: usulan,
        },
      ],
      attributes: {
        exclude: ["password", "roles"],
      },
    });

    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    errResponse({ res, e });
  }
});
router.post("/getMhsByNoBp", verifyJWT, async (req, res) => {
  const { no_bp, semester, tahun = yearNow } = req.body;
  try {
    const getDatasMhs = await readFn({
      model: mhs,
      type: "find",
      where: {
        no_bp,
      },
      exclude: ["password", "roles"],
      usePaginate: false,
    });

    const objDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

    if (Object.keys(objDatasMhs || {})?.length) {
      const getUsulan = await readFn({
        model: usulan,
        where: {
          semester: semester || objDatasMhs?.semester || "",
          tahun: tahun || "",
          no_bp,
        },
        attributes: [
          "no_bp",
          "status_judul",
          "status_usulan",
          "semester",
          "tahun",
        ],
        include: [
          {
            model: dosen,
            attributes: ["name", "photo", "pendidikan", "jabatan"],
          },
        ],
        paranoid: false,
      });

      const arrUsulanDosen = JSON.parse(JSON.stringify(getUsulan))?.map(
        (usul) => ({ ...usul, ...usul?.dosen })
      );

      arrUsulanDosen?.forEach((usulDosen) => {
        delete usulDosen["dosen"];
      });

      res.send({
        status: 200,
        data: { ...objDatasMhs, dosen: arrUsulanDosen },
        getUsulan,
      });
    } else {
      errResponse({ res, e: "Data Mahasiswa tidak tersedia", status: 404 });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE-
router.post("/addMhs", verifyJWT, forbiddenResponse, async (req, res) => {
  const hashPassword = await encryptPassword(
    req?.body?.password || "password123"
  );

  createFn({
    model: mhs,
    data: {
      ...req?.body,
      password: hashPassword,
    },
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
    })
    .catch((e) => {
      errResponse({ res, e });
    });
});

router.post("/addMultipleDataMhs", verifyJWT, forbiddenResponse, (req, res) => {
  const { arrDatas } = req.body;

  multipleFn({
    model: mhs,
    arrDatas: arrDatas?.map((data) => {
      return {
        ...data,
        password: "password123",
      };
    }),
    type: "add",
  })
    ?.then(() => {
      res?.status(200).send({ status: 200, message: "Sukses nambah data" });
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
      errResponse({ e, res });
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
        errResponse({ e, res });
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
      errResponse({ e, res });
    });
});

module.exports = {
  mhsRoute: router,
};
