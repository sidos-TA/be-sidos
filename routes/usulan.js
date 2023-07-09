const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { mhs, dosen, kategori, usulan, sequelize } = require("../models");
const arrJabatanDatas = require("../constants/jabatanValue");
const arrPendidikanValue = require("../constants/pendidikanValue");
const { EDAS_Winnowing } = require("../spk_module/EDAS_Winnowing");
const multipleFn = require("../helpers/mainFn/multipleFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const kalkulasiMhsValue = require("../helpers/kalkulasiMhsValue");
const { uuid } = require("uuidv4");
const updateFn = require("../helpers/mainFn/updateFn");
const {
  formatResponseSameKey,
} = require("../controller/bimbingan/getBimbingan");

// -READ-
router?.post("/getSPK", async (req, res) => {
  const { page, judul, bidang, jdl_from_dosen } = req.body;
  try {
    const arrDatasDosen = await readFn({
      model: dosen,
      type: "all",
      usePaginate: false,
    });

    const arrDatasKategori = await readFn({
      model: kategori,
      type: "all",
      page,
      isExcludeId: false,
      usePaginate: false,
    });

    const arrDatasParsing = JSON.parse(JSON.stringify(arrDatasDosen));
    const arrKategoriParsing = JSON.parse(JSON.stringify(arrDatasKategori));

    const arrDsnDataForSPK = arrDatasParsing.map((data) => {
      return {
        id: data?.id,
        dosenName: data?.name,
        judulPenelitian: JSON.parse(data?.penelitian)?.map(
          (penelitian) => penelitian?.title
        ),
        SKS: data?.sks,
        nMhs: data?.n_mhs_usulan,
        keahlian: JSON.parse(data?.bidang)?.includes(bidang) ? 1 : 0,
        jbtn: arrJabatanDatas?.find(
          (jbtn) => jbtn?.jabatan === data?.jabatan?.toLowerCase()
        )?.point,
        pend: arrPendidikanValue?.find(
          (pend) => pend?.pendidikan === data?.pendidikan?.toLowerCase()
        )?.point,
        isJudulDriDosen:
          jdl_from_dosen?.toLowerCase() === data?.name?.toLowerCase() ? 2 : 1,
      };
    });

    const spkResult = EDAS_Winnowing({
      strJudulMhs: judul,
      dataDosen: arrDsnDataForSPK,
      bobotKriteria: arrKategoriParsing,
    });

    res.status(200).send({ status: 200, data: spkResult });
  } catch (e) {
    res.status(400).send({ status: 400, data: [], message: e?.message });
  }
});

router.post("/getUsulan", async (req, res) => {
  const { no_bp } = req.body;
  try {
    const getDatasUsulan = await readFn({
      model: usulan,
      type: "all",
      include: [
        {
          model: dosen,
        },
      ],
      ...(no_bp && {
        where: {
          no_bp,
        },
      }),
    });
    const arrDatasUsulan = JSON.parse(JSON.stringify(getDatasUsulan));

    const arrDatas = formatResponseSameKey({
      arrDatas: arrDatasUsulan,
      propsKey: "no_bp",
      propsMergeToArray: "dosen",
    });
    res.status(200).send({ status: 200, data: arrDatas });
  } catch (e) {
    // console.log("e : ", e);
    res.status(400).send({ status: 400, message: e });
  }
});

// -CREATE-
router.post("/addUsulan", async (req, res) => {
  const { no_bp, nip } = req.body;
  try {
    const arrDatas = nip?.map((dataNip) => {
      return {
        ...req?.body,
        nip: dataNip,
        id: uuid(),
      };
    });

    const getDataMhs = await readFn({
      model: mhs,
      where: {
        no_bp,
        is_usul: true,
      },
      type: "find",
      usePaginate: false,
    });

    const dataMhs = JSON.parse(JSON.stringify(getDataMhs));

    // cek dulu apakah udh mengusulkan atau blm
    if (!dataMhs?.is_usul) {
      usulan.addHook("afterBulkCreate", async (usulan, options) => {
        // tambah jumlah mahasiswa usulan
        await kalkulasiMhsValue({
          act: "inc_n_mhs",
          where: {
            nip,
          },
          propsCalculate: "n_mhs_usulan",
          transaction: options?.transaction,
        });

        // update status is_usul dan status judul mhs
        await updateFn({
          model: mhs,
          data: {
            is_usul: true,
            status_judul: "usulan",
          },
          where: {
            no_bp,
          },
          isTransaction: true,
          transaction: options.transaction,
        });
      });

      await sequelize.transaction(async (transaction) => {
        await multipleFn({
          model: usulan,
          arrDatas,
          type: "add",
          isTransaction: true,
          transaction,
        });
      });
      res?.status(200)?.send({ status: 200, message: "Sukses nambah usulan" });
    } else {
      throw new Error(`Mahasiswa ${dataMhs?.name} sudah mengusulkan`);
    }
  } catch (e) {
    res?.status(400).send({ status: 400, error: e?.message });
  }
});

// -UPDATE-
router.post("/updateBimbingan", async (req, res) => {
  const { nip, no_bp } = req.body;
  try {
    usulan.addHook("beforeBulkDestroy", async (usulan, options) => {
      await kalkulasiMhsValue({
        act: "dec_n_mhs",
        where: {
          nip,
        },
        propsCalculate: "n_mhs_usulan",
        transaction: options?.transaction,
      });
    });

    await sequelize.transaction(async (transaction) => {
      // ini sewaktu kaprodi ngapus usulan, dan melakukan update bimbingan

      await deleteFn({
        model: usulan,
        where: {
          no_bp,
          nip,
        },
        isTransaction: true,
        transaction,
        force: true,
      });
    });
    res.status(200).send({ status: 200, message: "Update bimbingan berhasil" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

// -DELETE-
router.post("/deleteUsulan", async (req, res) => {
  const { no_bp, nip } = req.body;
  try {
    await sequelize.transaction(async (transaction) => {
      // ini sewaktu kaprodi ngapus usulan, blm update bimbingan
      await deleteFn({
        model: usulan,
        where: {
          no_bp,
          nip,
        },
        isTransaction: true,
        transaction,
      });
    });

    res.status(200).send({ status: 200, message: "Sukses hapus usulan" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e });
  }
});

router.post("/restoreUsulan", async (req, res) => {
  try {
    const nRestore = await usulan.restore();
    if (nRestore !== 0) {
      res.send({ message: `Berhasil restore data sebayak ${nRestore}` });
    } else {
      throw new Error("Tidak ada data yg direstore");
    }
  } catch (e) {
    res.status(400).send({ status: 400, message: e?.message });
  }
});

module.exports = {
  usulanRoute: router,
};
