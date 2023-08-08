const errResponse = require("../helpers/errResponse");
const router = require("./router");
const { usulan, mhs, dosen, setting } = require("../models");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const readFn = require("../helpers/mainFn/readFn");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");

router.post("/addKeputusan", verifyJWT, forbiddenResponse, async (req, res) => {
  const { no_bp, nip } = req.body;

  // utk menentukan dospem sblm ditentukan status judul
  try {
    const getDataUsulan = await readFn({
      model: usulan,
      where: {
        no_bp,
      },
      usePaginate: false,
      isExcludeId: false,
    });

    const arrDatasUsulan = JSON.parse(JSON.stringify(getDataUsulan));

    const arrDosenNotChoosed = arrDatasUsulan?.filter(
      (usul) => !nip?.includes(usul?.nip)
    );

    // hapus data dosen yang g kepilih
    await deleteFn({
      model: usulan,
      where: {
        nip: arrDosenNotChoosed?.map((usul) => usul?.nip),
        no_bp,
      },
    });

    await updateFn({
      model: usulan,
      data: {
        status_usulan: "confirmed",
      },
      where: {
        no_bp,
      },
    });

    res
      .status(200)
      .send({ status: 200, message: "Sukses menentukan dosen pembimbing" });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -READ-
router.post("/getKeputusan", verifyJWT, async (req, res) => {
  const { status_judul, status_usulan, semester, tahun, no_bp } = req.body;

  const arrExcludeUsulan = ["createdAt", "updatedAt", "nip", "no_bp", "id"];
  const arrExcludeDosen = [
    "password",
    "createdAt",
    "updatedAt",
    "roles",
    "linkDataPenelitian",
  ];
  const arrExcludeMhs = ["password", "roles", "usulans"];

  try {
    const getSetting = await readFn({
      model: setting,
    });

    const getKeputusan = await readFn({
      model: mhs,
      type: "all",
      include: [
        {
          model: usulan,
          where: {
            ...(status_judul && {
              "$usulans.status_judul$": status_judul,
            }),
            status_usulan,
            ...(no_bp && {
              no_bp,
            }),
            "$usulans.semester$": semester || getSetting?.[0]?.semester || "",
            "$usulans.tahun$": tahun || getSetting?.[0]?.tahun || "",
          },
          include: [
            {
              model: dosen,
              attributes: {
                exclude: arrExcludeDosen,
              },
            },
          ],
          attributes: {
            exclude: arrExcludeUsulan,
          },
        },
      ],
      // where: {
      //   semester: semester || getSetting?.[0]?.semester || "",
      //   tahun,
      // },
      exclude: arrExcludeMhs,
    });

    res.status(200).send({ status: 200, data: getKeputusan });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getKeputusanByNoBp", verifyJWT, async (req, res) => {
  const { status_judul, no_bp } = req.body;

  const arrExcludeDosen = [
    "createdAt",
    "updatedAt",
    "password",
    "roles",
    "linkDataPenelitian",
    "penelitian",
  ];

  try {
    const getUsulanBasedNoBp = await readFn({
      model: usulan,
      where: {
        no_bp,
      },
      exclude: ["roles", "password", "deletedAt", "nip"],
      type: "find",
    });

    const getDataKeputusan = await readFn({
      model: mhs,
      type: "find",
      isExcludeId: false,
      where: {
        no_bp,
      },
      include: [
        {
          model: usulan,
          include: [
            {
              model: dosen,
              attributes: {
                exclude: arrExcludeDosen,
              },
            },
          ],
          attributes: ["nip"],
          where: {
            ...(status_judul && {
              $status_judul$: status_judul,
            }),
          },
        },
      ],
      exclude: ["password", "roles"],
    });

    const objUsulanBasedNoBp = JSON.parse(JSON.stringify(getUsulanBasedNoBp));
    const objDataKeputusan = JSON.parse(JSON.stringify(getDataKeputusan));

    const objDatas = { ...objDataKeputusan, ...objUsulanBasedNoBp };
    res.status(200).send({
      status: 200,
      data: objDatas,
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

module.exports = { keputusanRoute: router };
