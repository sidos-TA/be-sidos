const router = require("./router");
const { bimbingan, usulan, mhs, dosen, sequelize } = require("../models");
const {
  addToTabelJudul,
} = require("../controller/bimbingan/addBimbingan/addToTabelJudul");

const {
  updateStatusJudul,
} = require("../controller/bimbingan/addBimbingan/updateStatusJudul");
const {
  addToTabelBimbingan,
} = require("../controller/bimbingan/addBimbingan/addToTabelBimbingan");
const {
  updateStatusUsulan,
} = require("../controller/bimbingan/addBimbingan/updateStatusUsulan");
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
const formatResponseSameKey = require("../controller/bimbingan/formatResponseSameKey");
const deleteFn = require("../helpers/mainFn/deleteFn");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const createFn = require("../helpers/mainFn/createFn");
const { uuid } = require("uuidv4");
const multipleFn = require("../helpers/mainFn/multipleFn");
const updateJudulAddJudulMhs = require("../controller/bimbingan/addBimbingan/updateJudulAddJudulMhs");
const deleteIfSttsUsulanNotConfirm = require("../controller/bimbingan/addBimbingan/deleteIfSttsUsulanNotConfirm");
const updateFn = require("../helpers/mainFn/updateFn");

// -READ-
router.post("/getBimbingan", verifyJWT, forbiddenResponse, async (req, res) => {
  try {
    const objSearch = filterByKey({ req });
    const getDatasBimbingan = await readFn({
      model: bimbingan,
      type: "all",
      include: [dosen, mhs],
      where: objSearch,
      ...(Object.keys(objSearch)?.length && {
        usePaginate: false,
      }),
    });

    const arrDatasBimbingan = JSON.parse(JSON.stringify(getDatasBimbingan));

    const arrDatas = formatResponseSameKey({
      arrDatas: arrDatasBimbingan,
      propsKey: "no_bp",
      propsMergeToArray: "dosen",
    })?.map((data) => {
      return { ...data, ...data?.mh };
    });

    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post(
  "/getBimbinganByKey",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const key = Object?.keys(req?.body)?.[0];
    try {
      const getDatasBimbingan = await readFn({
        model: bimbingan,
        type: "all",
        include: [
          {
            model: key === "no_bp" ? dosen : mhs,
          },
        ],
        where: {
          [key]: req?.body?.[key],
        },
      });
      const getDatasMhs = await readFn({
        model: mhs,
        type: "find",
        where: {
          no_bp: req?.body?.[key],
        },
      });
      const getDatasDosen = await readFn({
        model: dosen,
        type: "find",
        where: {
          nip: req?.body?.[key],
        },
      });

      const arrDatasBimbingan = JSON.parse(JSON.stringify(getDatasBimbingan));
      const datasMhs = JSON.parse(JSON.stringify(getDatasMhs));
      const datasDosen = JSON.parse(JSON.stringify(getDatasDosen));

      const [datas] = formatResponseSameKey({
        arrDatas: arrDatasBimbingan,
        propsKey: key,
        propsMergeToArray: `${key === "no_bp" ? "mh" : "dosen"}`,
      });

      if (key === "no_bp") {
        res.status(200).send({ status: 200, data: { ...datas, ...datasMhs } });
      } else {
        res
          .status(200)
          .send({ status: 200, data: { ...datas, ...datasDosen } });
      }
    } catch (e) {
      res.status(400).send({ status: 400, error: e });
    }
  }
);

// -CREATE-
router.post("/addBimbingan", verifyJWT, forbiddenResponse, async (req, res) => {
  const { no_bp, nip, judul, bidang, tingkatan, status_judul, status_usulan } =
    req.body;
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

    const arrUsulanChoosed = arrDatasUsulan?.filter((usul) =>
      nip?.includes(usul?.nip)
    );
    const arrUsulanNotChoosed = arrDatasUsulan?.filter(
      (usul) => !nip?.includes(usul?.nip)
    );

    if (Array.isArray(nip)) {
      const arrDatas = nip?.map((dataNip) => {
        return {
          ...req?.body,
          status_usulan,
          nip: dataNip,
          id: uuid(),
        };
      });

      // ini kalau skenario dari unavailable ke confirmed
      const dataUsulan =
        status_usulan !== "no_confirm" ? arrDatas : arrUsulanChoosed;
      // hapus data dosen yang g kepilih

      await deleteFn({
        model: usulan,
        where: {
          nip: arrUsulanNotChoosed?.map((usul) => usul?.nip),
          no_bp,
        },
      });
      // kalau usulan telah diterima 2 dosen
      if (nip?.length === 2) {
        bimbingan.addHook("afterBulkCreate", async (bimbingan, options) => {
          // add data judul (judul)
          if (status_judul === "terima") {
            await addToTabelJudul({
              judul,
              bidang,
              options,
              tingkatan,
            });
          }
          // update  tambah judul acc ke mhs (mhs)
          updateJudulAddJudulMhs({
            judul,
            no_bp,
            options,
            status_judul,
          })
            ?.then(async () => {
              if (status_usulan !== "no confirmed") {
                await deleteIfSttsUsulanNotConfirm({ no_bp, options });
                nip?.forEach((dataNip) => {
                  createFn({
                    model: usulan,
                    data: {
                      ...req?.body,
                      nip: dataNip,
                      status_usulan: "confirmed",
                      id: uuid(),
                    },
                    isTransaction: true,
                    transaction: options?.transaction,
                  });
                });
              } else {
                arrUsulanChoosed?.forEach((usul) => {
                  updateFn({
                    model: usulan,
                    data: {
                      status_usulan: "confirmed",
                    },
                    isTransaction: true,
                    transaction: options?.transaction,
                    where: {
                      no_bp,
                      nip: usul?.nip,
                    },
                  });
                });
              }
            })
            ?.catch((e) => {
              throw new Error(e);
            });
        });

        if (!status_judul) {
          arrUsulanChoosed?.forEach((usul) => {
            updateFn({
              model: usulan,
              data: {
                status_usulan: "confirmed",
              },
              where: {
                no_bp,
                nip: usul?.nip,
              },
            });
          });
        } else {
          await sequelize?.transaction(async (transaction) => {
            // add ke tabel bimbingan
            addToTabelBimbingan({
              arrDatas: dataUsulan?.map((usul) => ({
                ...usul,
                status_judul,
              })),
              transaction,
            });
          });
        }

        res.status(200).send({
          status: 200,
          message: "Sukses nambah bimbingan",
        });
      } else if (nip?.length === 1) {
        // update status_usulan
        updateStatusUsulan({
          arrDatas: dataUsulan,
          status_usulan: "partially confirmed",
          no_bp,
        });
        res?.status(200)?.send({
          status: 200,
          message: "Sukses update status usulan mahasiswa partially confirmed",
        });
      } else {
        // data usulan diambil pertama dan dosennya akan null, status usulan mhs jdi unavailable
        const dataUsulanUnavailable = {
          ...arrDatasUsulan?.[0],
          nip: null,
          status_usulan: "unavailable",
        };

        // pakai create karena udh di apus utk smua dosen yg g kepilih
        createFn({
          model: usulan,
          data: dataUsulanUnavailable,
        })
          ?.then(() => {
            res?.status(200)?.send({
              status: 200,
              message: "Sukses update status usulan mahasiswa",
            });
          })
          ?.catch((e) => {
            throw new Error(e);
          });
      }
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
