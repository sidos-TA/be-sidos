const errResponse = require("../helpers/errResponse");
const router = require("./router");
const { usulan, mhs, dosen, setting } = require("../models");
const updateFn = require("../helpers/mainFn/updateFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const readFn = require("../helpers/mainFn/readFn");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const filterByKey = require("../helpers/filterByKey");

router.post("/addKeputusan", verifyJWT, forbiddenResponse, async (req, res) => {
  const { no_bp, nip, id_usulan } = req.body;

  // utk menentukan dospem sblm ditentukan status judul
  try {
    const getDataUsulan = await readFn({
      model: usulan,
      where: {
        id_usulan,
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
        id_usulan,
      },
    });

    await updateFn({
      model: usulan,
      data: {
        status_usulan: "confirmed",
      },
      where: {
        no_bp,
        id_usulan,
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

  const objSearchMhs = filterByKey({ req, arrSearchParams: ["prodi"] });

  const arrExcludeUsulan = ["createdAt", "updatedAt", "nip", "no_bp", "id"];

  const arrExcludeMhs = [
    "password",
    "roles",
    "usulans",
    "createdAt",
    "updatedAt",
  ];

  try {
    const getSetting = await readFn({
      model: setting,
    });

    const getDatasKeputusan = await readFn({
      model: usulan,
      where: {
        ...(status_judul && {
          status_judul: "usulan",
        }),
        ...(no_bp && {
          no_bp,
        }),
        status_usulan: "confirmed",
        semester: semester || getSetting?.[0]?.semester || "",
        tahun: tahun || getSetting?.[0]?.tahun || "",
      },
      include: [
        {
          model: mhs,
          attributes: {
            exclude: arrExcludeMhs,
          },
          where: objSearchMhs,
        },
      ],
      exclude: arrExcludeUsulan,
      group: ["id_usulan"],
    });

    res.status(200).send({ status: 200, data: getDatasKeputusan });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getDetailKeputusan", verifyJWT, async (req, res) => {
  const { status_judul, id_usulan } = req.body;

  const arrExcludeDosen = [
    "createdAt",
    "updatedAt",
    "password",
    "roles",
    "linkDataPenelitian",
    "penelitian",
  ];

  try {
    const getUsulanDetail = await readFn({
      model: usulan,
      where: {
        id_usulan,
      },
      exclude: ["roles", "password", "deletedAt", "nip"],
      type: "find",
    });

    const objUsulanDetail = JSON.parse(JSON.stringify(getUsulanDetail));

    const getDataKeputusan = await readFn({
      model: mhs,
      type: "find",
      isExcludeId: false,
      where: {
        no_bp: objUsulanDetail?.no_bp,
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
            id_usulan,
          },
        },
      ],
      exclude: ["password", "roles"],
    });

    const objDataKeputusan = JSON.parse(JSON.stringify(getDataKeputusan));

    const objDatas = { ...objDataKeputusan, ...objUsulanDetail };
    res.status(200).send({
      status: 200,
      data: objDatas,
    });
  } catch (e) {
    errResponse({ res, e });
  }
});

module.exports = { keputusanRoute: router };
