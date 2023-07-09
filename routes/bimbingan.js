const router = require("./router");
const { bimbingan, usulan, mhs, dosen, sequelize } = require("../models");
const {
  addToTabelJudul,
} = require("../controller/bimbingan/addBimbingan/addToTabelJudul");
const {
  inc_nMhsBimbingan,
} = require("../controller/bimbingan/addBimbingan/inc_nMhsBimbingan");
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
const {
  formatResponseSameKey,
} = require("../controller/bimbingan/getBimbingan");
const updateFn = require("../helpers/mainFn/updateFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const kalkulasiMhsValue = require("../helpers/kalkulasiMhsValue");
const deleteFn = require("../helpers/mainFn/deleteFn");

// -READ-
router.post("/getBimbingan", async (req, res) => {
  try {
    const getDatasBimbingan = await readFn({
      model: bimbingan,
      type: "all",
      include: [dosen],
    });

    const arrDatasBimbingan = JSON.parse(JSON.stringify(getDatasBimbingan));

    const arrDatas = formatResponseSameKey({
      arrDatas: arrDatasBimbingan,
      propsKey: "no_bp",
      propsMergeToArray: "dosen",
    });

    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send({ status: 400, error: e });
  }
});

router.post("/getBimbinganByKey", async (req, res) => {
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

    const arrDatasBimbingan = JSON.parse(JSON.stringify(getDatasBimbingan));

    const arrDatas = formatResponseSameKey({
      arrDatas: arrDatasBimbingan,
      propsKey: key,
      propsMergeToArray: `${key === "no_bp" ? "mh" : "dosen"}`,
    });

    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    res.status(400).send({ status: 400, error: e });
  }
});

// -CREATE-
router.post("/addBimbingan", async (req, res) => {
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
      // kalau usulan telah diterima 2 dosen
      if (nip?.length === 2) {
        bimbingan.addHook("afterBulkCreate", async (bimbingan, options) => {
          // add data judul (judul)
          addToTabelJudul({ judul, bidang, options, tingkatan })
            ?.then(() => {
              // add jumlah n_mhs_bimbingan  (dosen)
              inc_nMhsBimbingan({ nip, options })
                ?.then(() => {
                  // update status_judul (mhs)
                  updateStatusJudul({ status_judul, no_bp, options })
                    ?.then(() => {
                      // kurangi jumlah n_mhs_usulan dosen yg tidak terpilih sbg pembimbing
                      kalkulasiMhsValue({
                        act: "dec_n_mhs",
                        propsCalculate: "n_mhs_usulan",
                        transaction: true,
                        where: {
                          nip: arrUsulanNotChoosed?.map((usul) => usul?.nip),
                        },
                      })
                        ?.then(() => {
                          // tambah judul acc ke mhs (mhs)
                          updateFn({
                            model: mhs,
                            data: {
                              judul_acc: judul,
                            },
                            isTransaction: true,
                            transaction: options?.transaction,
                            where: {
                              no_bp,
                            },
                          })?.then(() => {
                            // update status_usulan (usulan)
                            /**Entah knp pakai multipleFn malah auto nambah n_mhs_usulan */
                            nip?.forEach((dataNip) => {
                              updateFn({
                                model: usulan,
                                data: {
                                  status_usulan,
                                },
                                where: {
                                  nip: dataNip,
                                },
                              });
                            });
                          });
                        })
                        ?.catch((e) => {
                          throw new Error(e);
                        });
                    })
                    ?.catch((e) => {
                      throw new Error(e);
                    });
                })
                ?.catch((e) => {
                  throw new Error(e);
                });
            })
            ?.catch((e) => {
              throw new Error(e);
            });
        });

        await sequelize?.transaction(async (transaction) => {
          // add ke tabel bimbingan
          addToTabelBimbingan({ arrDatas: arrUsulanChoosed, transaction });
        });

        res
          .status(200)
          .send({ status: 200, message: "Sukses nambah bimbingan" });
      } else if (nip?.length === 1) {
        // update status_usulan
        await updateStatusUsulan({ no_bp, status_usulan: "partially confirm" });
        throw new Error("Butuh 1 dosen lagi untuk jadi pembimbing");
      } else {
        await updateStatusUsulan({ no_bp, status_usulan: "no confirm" });

        throw new Error("Setidaknya 2 dosen untuk jadi pembimbing");
      }
    }
  } catch (e) {
    res?.status(400)?.send({ error: e?.message, status: 400 });
  }
});

// -DELETE-
router.post("/deleteBimbingan", async (req, res) => {
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
    res?.status(400)?.send({ error: e?.message, status: 400 });
  }
});
module.exports = { bimbinganRoute: router };
