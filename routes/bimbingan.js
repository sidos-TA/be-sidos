const router = require("./router");
const { bimbingan, usulan, mhs, dosen, setting } = require("../models");
const {
  addToTabelJudul,
} = require("../controller/bimbingan/addBimbingan/addToTabelJudul");

const {
  dec_nMhsBimbingan,
} = require("../controller/bimbingan/deleteBimbingan/dec_nMhsBimbingan");
const {
  dec_nMhsUsulan,
} = require("../controller/bimbingan/deleteBimbingan/dec_nMhsUsulan");
const {
  deleteDataBimbingan,
} = require("../controller/bimbingan/deleteBimbingan/deleteDataBimbingan");
const readFn = require("../helpers/mainFn/readFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const updateSttsJudulMhs = require("../controller/bimbingan/addBimbingan/updateSttsJudulMhs");
const { Op } = require("sequelize");
const createFn = require("../helpers/mainFn/createFn");

// -READ-
router.post("/getBimbingan", verifyJWT, forbiddenResponse, async (req, res) => {
  const { semester, tahun } = req.body;

  const objSearchUsulan = filterByKey({
    req,
    arrSearchParams: ["bidang", "status_judul"],
  });
  const objSearchMhs = filterByKey({ req, arrSearchParams: ["prodi"] });

  const arrExcludeMhs = ["password", "roles"];
  const arrExcludeUsulan = [
    "createdAt",
    "roles",
    "createdAt",
    "updatedAt",
    "no_bp",
    "nip",
  ];
  const arrExcludeDosen = [
    "createdAt",
    "roles",
    "password",
    "createdAt",
    "updatedAt",
    "roles",
    "linkDataPenelitian",
    "penelitian",
  ];
  try {
    const getDataSettings = await readFn({
      model: setting,
      type: "all",
    });

    if (getDataSettings?.[0]?.semester) {
      const getDatasMhs = await readFn({
        model: mhs,
        type: "all",
        exclude: arrExcludeMhs,
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
            attributes: [
              "id_usulan",
              "judul",
              "bidang",
              "status_judul",
              "keterangan",
            ],
            where: {
              "$usulans.status_judul$": { [Op.ne]: ["usulan"] },
              "$usulans.status_usulan$": "confirmed",
              "$usulans.semester$": semester || getDataSettings?.[0]?.semester,
              "$usulans.tahun$": tahun || getDataSettings?.[0]?.tahun || "",
              ...objSearchUsulan,
            },
          },
        ],
        where: {
          ...objSearchMhs,
          // semester: semester || getDataSettings?.[0]?.semester,
          // tahun,
        },
      });

      const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

      res.status(200).send({
        status: 200,
        data: arrDatasMhs?.map((data) => ({
          ...data,
          dosen_pembimbing1: data?.usulans?.[0]?.dosen?.name,
          dosen_pembimbing2: data?.usulans?.[1]?.dosen?.name,
          judul: data?.usulans?.[0]?.judul,
          bidang: data?.usulans?.[0]?.bidang,
          status_judul: data?.usulans?.[0]?.status_judul,
          keterangan: data?.usulans?.[0]?.keterangan,
        })),
        getDatasMhs,
      });
    } else {
      errResponse({
        res,
        e: "Mohon hubungi kaprodi untuk membuat setting terlebih dahulu",
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE-
router.post("/addBimbingan", verifyJWT, forbiddenResponse, async (req, res) => {
  const {
    no_bp,
    nip,
    judul,
    bidang,
    tingkatan,
    status_judul,
    keterangan,
    id_usulan,
  } = req.body;
  try {
    if (Array.isArray(nip)) {
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

      const addAfterSPK = async () => {
        for (let i = 0; i < nip?.length; i++) {
          if (
            !arrDatasUsulan?.find(
              (data) => String(data?.nip) === String(nip?.[i])
            )
          ) {
            await createFn({
              model: usulan,
              data: {
                ...req?.body,
                nip: nip?.[i],
                status_usulan: "confirmed",
                status_judul: "usulan",
              },
            });
          }
        }
      };

      // hapus data dosen yang g kepilih
      await deleteFn({
        model: usulan,
        where: {
          nip: arrDosenNotChoosed?.map((usul) => usul?.nip),
          no_bp,
          id_usulan,
        },
      });

      // kalau ada perubahan/tambahan dospem berdasarkan hasil rapat
      await addAfterSPK();

      await updateSttsJudulMhs({
        judul,
        no_bp,
        status_judul,
        keterangan,
      });

      if (status_judul === "terima") {
        await addToTabelJudul({
          judul,
          bidang,
          tingkatan,
        });
      }

      res.status(200).send({
        status: 200,
        message: "Sukses nambah bimbingan",
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

// -DELETE-
router.post(
  "/deleteBimbingan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { nip, no_bp } = req.body;
    try {
      bimbingan.addHook("afterBulkDestroy", async (bimbingan, options) => {
        // kurang 1 n_mhs_bimbingan
        await dec_nMhsBimbingan({ nip, options });

        // kurang 1 n_mhs_usulan
        await dec_nMhsUsulan({ nip, options });
      });

      // hapus data bimbingan dosen terkait
      await deleteDataBimbingan({ nip, no_bp });

      // hapus data usulan dsn terkait
      await deleteFn({
        model: usulan,
        where: {
          nip,
          no_bp,
        },
      });

      res
        ?.status(200)
        ?.send({ status: 200, message: "Sukses hapus data bimbingan" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);
module.exports = { bimbinganRoute: router };
