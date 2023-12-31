const { Op } = require("sequelize");
const encryptPassword = require("../helpers/encryptPassword");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const getTotalPageSize = require("../helpers/getTotalPageSize");
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
  const { page, semester, tahun } = req.body;

  try {
    const getDataSettings = await readFn({
      model: setting,
      type: "all",
    });

    const objSearchDataMhs = filterByKey({
      req,
      arrSearchParams: ["name", "prodi"],
    });

    const getDatasMhs = await readFn({
      model: mhs,
      page,
      where: {
        tahun: tahun || getDataSettings?.[0]?.tahun || "",
        semester: semester || getDataSettings?.[0]?.semester || "",
        ...objSearchDataMhs,
      },
      ...(Object.keys(objSearchDataMhs)?.length && {
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
      type: "all",
      order: [["name", "ASC"]],
    });

    const getAllDatasMhs = await readFn({
      model: mhs,
      page,
      where: {
        tahun: tahun || getDataSettings?.[0]?.tahun || "",
        semester: semester || getDataSettings?.[0]?.semester || "",
        ...objSearchDataMhs,
      },
      usePaginate: false,
      attributes: {
        exclude: ["password", "roles"],
      },
      type: "all",
    });
    const arrAllDatasMhs = JSON.parse(JSON.stringify(getAllDatasMhs));

    res.status(200).send({
      status: 200,
      data: getDatasMhs,
      // getDatasMhs,
      countAllDatas: arrAllDatasMhs?.length,
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getMhsByNoBp", verifyJWT, async (req, res) => {
  const { no_bp, semester, tahun } = req.body;
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
          status_judul: {
            [Op.ne]: "usulan",
          },
        },
        attributes: [
          "no_bp",
          "status_judul",
          "status_usulan",
          "semester",
          "tahun",
          "judul",
          "file_pra_proposal",
          "bidang",
          "keterangan",
        ],
        include: [
          {
            model: dosen,
            attributes: ["name", "photo", "pendidikan", "jabatan"],
          },
        ],

        // paranoid: false,
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

  if (req.body?.no_bp) {
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
        // if (e?.parent?.code === "ER_DUP_ENTRY") {
        //   errResponse({
        //     res,
        //     e: `Data dengan No. Bp ${req.body.no_bp} telah ada`,
        //   });
        // } else {
        //   errResponse({ res, e });
        // }
        errResponse({ res, e });
      });
  } else {
    errResponse({ res, e: "Mohon masukkan no_bp" });
  }
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

  delete req.body["photo"];

  updateFn({ model: mhs, data: req?.body, where: { no_bp } })
    ?.then(async () => {
      const getNewDatasMhs = await readFn({
        model: mhs,
        where: {
          no_bp,
        },
        type: "find",
        usePaginate: false,
        attributes: ["prodi"],
      });

      res?.status(200).send({
        status: 200,
        message: "Sukses update data",
        data: getNewDatasMhs,
      });
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
