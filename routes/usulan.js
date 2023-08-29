const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const {
  mhs,
  dosen,
  kategori,
  judulData,
  usulan,
  setting,
  penelitian,
  bidang: bidangModel,
  sequelize,
} = require("../models");
const cloudinary = require("cloudinary");
const arrJabatanDatas = require("../constants/jabatanValue");
const arrPendidikanValue = require("../constants/pendidikanValue");
const { EDAS_Winnowing } = require("../spk_module/EDAS_Winnowing");
const multipleFn = require("../helpers/mainFn/multipleFn");
const deleteFn = require("../helpers/mainFn/deleteFn");
const { uuid } = require("uuidv4");
const errResponse = require("../helpers/errResponse");
const filterByKey = require("../helpers/filterByKey");
const verifyJWT = require("../helpers/verifyJWT");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const forbiddenResponseDosen = require("../helpers/forbiddenResponseDosen");
const {
  jaccardSimilarityHandler,
  allWinnowingDosen,
} = require("../spk_module/Winnowing");
const { uniqueArrObj, uniqueArr } = require("../helpers/uniqueArr_ArrObj");
const sortArrObj = require("../helpers/sortArrObj");
const { Op } = require("sequelize");
const Winnowing = require("../spk_module/Winnowing");

// -READ-
router?.post("/getSPK", async (req, res) => {
  const { page, judul, bidang, jdl_from_dosen, semester, tahun } = req.body;
  try {
    const getSetting = await readFn({
      model: setting,
    });
    const arrSetting = JSON.parse(JSON.stringify(getSetting));

    const attrDosen = ["name", "nip", "sks", "jabatan", "pendidikan"];

    const getDatasDosen = await readFn({
      model: dosen,
      type: "all",
      page,
      usePaginate: false,
      attributes: attrDosen,
      include: [
        {
          model: penelitian,
        },
        {
          model: bidangModel,
        },
      ],
    });

    const getUsulanMhsUsul = await readFn({
      model: usulan,
      attributes: ["nip", "status_judul", "status_usulan"],
      where: {
        semester: semester || arrSetting?.[0]?.semester || "",
        tahun: tahun || arrSetting?.[0]?.tahun || "",
      },
      usePaginate: false,
    });
    const getUsulanMhsBimbing = await readFn({
      model: usulan,
      attributes: ["nip", "status_judul", "status_usulan"],
      where: {
        status_usulan: "confirmed",
        status_judul: {
          [Op.ne]: "usulan",
        },
        semester: semester || arrSetting?.[0]?.semester || "",
        tahun: tahun || arrSetting?.[0]?.tahun || "",
      },
      usePaginate: false,
    });

    const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
    const datasDosen = arrDatasDosen?.map((dsn) => ({
      ...dsn,
      bidangs: uniqueArrObj({ arr: dsn?.bidangs, props: "bidang" }),
      penelitians: uniqueArrObj({
        arr: dsn?.penelitians,
        props: "judulPenelitian",
      }),
    }));

    const arrUsulanMhsUsul = JSON.parse(JSON.stringify(getUsulanMhsUsul));
    const arrUsulanMhsBimbing = JSON.parse(JSON.stringify(getUsulanMhsBimbing));

    const allData = [
      ...datasDosen,
      ...arrUsulanMhsUsul,
      ...arrUsulanMhsBimbing,
    ];

    // proses penentuan n_mhs_bimbingan dan n_mhs_usulan
    const result = Object.values(
      allData.reduce((init, curr) => {
        if (!init[curr.nip]) {
          init[curr.nip] = {
            ...curr,
            nip: curr.nip,
            n_mhs_bimbingan: 0,
            n_mhs_usulan: 0,
          };
        }

        if (arrUsulanMhsBimbing.some((mhs) => mhs.nip === curr.nip)) {
          init[curr.nip].n_mhs_bimbingan = arrUsulanMhsBimbing.filter(
            (mhs) => mhs.nip === curr.nip
          ).length;
        }

        if (arrUsulanMhsUsul.some((mhs) => mhs.nip === curr.nip)) {
          init[curr.nip].n_mhs_usulan = arrUsulanMhsUsul.filter(
            (mhs) => mhs.nip === curr.nip
          ).length;
        }

        return init;
      }, {})
    );

    const getDataKategori = await readFn({
      model: kategori,
      type: "all",
      page,
      isExcludeId: false,
      usePaginate: false,
    });

    const arrKategori = JSON.parse(JSON.stringify(getDataKategori));

    if (arrKategori?.length) {
      const arrDsnDataForSPK = result.map((data) => {
        return {
          id: data?.id,
          dosenName: data?.name,
          judulPenelitian: data?.penelitians?.map((penelitian) =>
            penelitian?.judulPenelitian?.trim()
          ),
          SKS: data?.sks,
          nMhs: data?.n_mhs_usulan,
          keahlian: data?.bidangs
            ?.map((bidangData) => bidangData?.bidang)
            ?.some((bdg) => bdg?.toLowerCase()?.includes(bidang?.toLowerCase()))
            ? 1
            : 0,
          // keahlian: data?.bidangs
          //   ?.map((bidangData) => bidangData?.bidang?.toLowerCase())
          //   .includes(bidang?.toLowerCase())
          //   ? 1
          //   : 0,
          jbtn: arrJabatanDatas?.find(
            (jbtn) => jbtn?.jabatan === data?.jabatan?.toLowerCase()
          )?.point,
          pend: arrPendidikanValue?.find(
            (pend) => pend?.pendidikan === data?.pendidikan?.toLowerCase()
          )?.point,
          isJudulDriDosen: jdl_from_dosen === data?.nip ? 2 : 1,
        };
      });

      const arrWinnowing = allWinnowingDosen({
        dataPenelitian: arrDsnDataForSPK,
        strJudulMhs: judul,
        kGramCount: 3,
        windowCount: 11,
      });

      const spkResult = EDAS_Winnowing({
        strJudulMhs: judul,
        dataDosen: arrDsnDataForSPK,
        bobotKriteria: arrKategori,
        kGramCount: arrSetting?.[0]?.kGram,
      });

      const dataDosenBySPK = [];

      spkResult?.forEach((spk) => {
        result?.forEach((dosen) => {
          if (dosen?.name === spk?.dosenName) {
            dataDosenBySPK.push({ ...dosen, skor: spk?.skor });
          }
        });
      });

      const roundUp2 = (num = 0) =>
        Math.ceil(num * Math.pow(10, 2)) / Math.pow(10, 2);

      res.status(200).send({
        status: 200,
        data: dataDosenBySPK,
        arrDsnDataForSPK,
        arrWinnowing: sortArrObj({
          arr: arrWinnowing,
          props: "winnowingValue",
          sortType: "DESC",
        })?.map((data) => ({
          ...data,
          winnowingValue: roundUp2(data?.winnowingValue),
        })),
        result,
      });
    } else {
      errResponse({
        res,
        e: "Data kategori masih kosong, mohon hubungi kaprodi anda",
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getUsulan", verifyJWT, async (req, res) => {
  const { no_bp, semester, tahun, page } = req.body;
  try {
    const objSearchMhs = filterByKey({
      req,
      arrSearchParams: ["name", "prodi"],
    });
    const objSearchUsulan = filterByKey({
      req,
      arrSearchParams: ["bidang"],
    });

    const getDataSettings = await readFn({
      model: setting,
      type: "all",
    });

    const objSetting = JSON.parse(JSON.stringify(getDataSettings))?.[0];

    if (getDataSettings?.length) {
      const getDatasUsulan = await readFn({
        model: usulan,
        type: "all",
        exclude: [
          "nip",
          "updatedAt",
          "deletedAt",
          "file_pra_proposal",
          "jdl_from_dosen",
          "keterangan",
        ],
        include: [
          {
            model: mhs,
            attributes: {
              exclude: ["password", "roles", "no_bp", "createdAt", "updatedAt"],
            },
            where: {
              ...objSearchMhs,
            },
          },
        ],
        where: {
          ...objSearchUsulan,
          ...(no_bp && {
            no_bp,
          }),
          status_usulan: "no confirmed",
          semester: semester || objSetting?.semester || "",
          tahun: tahun || objSetting?.tahun || "",
        },
        usePaginate: false,
        group: ["judul"],
      });

      const arrDatasUsulan = JSON.parse(JSON.stringify(getDatasUsulan));

      const pageSize = page * 10;

      const datasUsulan = arrDatasUsulan?.slice(pageSize - 10, pageSize);

      res.status(200).send({
        status: 200,
        data: datasUsulan,
        arrDatasUsulan,
        countAllDatas: arrDatasUsulan?.length,
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

router.post("/getJudulPenelitian", async (req, res) => {
  const {
    judul,
    kGram = 3,
    window = 5,
    nip,
    isGetAllWinnowing = true,
  } = req.body;
  try {
    const getDatasPenelitian = await readFn({
      model: penelitian,
      attributes: ["judulPenelitian", "nip"],
      usePaginate: false,
      ...(nip && {
        where: {
          nip,
        },
      }),
    });

    const getDatasDosen = await readFn({
      model: dosen,
      attrDosen: ["nip", "name"],
      usePaginate: false,
      ...(nip && {
        where: {
          nip,
        },
      }),
    });

    const arrDatasPenelitian = JSON.parse(JSON.stringify(getDatasPenelitian));
    const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));

    const objTempPenelitianDosen = {};

    arrDatasDosen?.forEach((dsn) => {
      objTempPenelitianDosen[dsn?.nip] = {
        nip: dsn?.nip,
        dosenName: dsn?.name,
      };
    });

    arrDatasPenelitian?.forEach((pnltn) => {
      if (objTempPenelitianDosen?.[pnltn?.nip]) {
        ///
        objTempPenelitianDosen[pnltn?.nip] = {
          ...objTempPenelitianDosen?.[pnltn?.nip],
          judulPenelitian: arrDatasPenelitian
            ?.filter((data) => data?.nip === pnltn?.nip)
            ?.map((data) => data?.judulPenelitian),
        };
        ///
      }
    });
    const arrPenelitianDosen = Object.values(objTempPenelitianDosen);

    const arrWinnowingValue = Winnowing.allWinnowingDosen({
      dataPenelitian: arrPenelitianDosen,
      strJudulMhs: judul,
      kGramCount: kGram,
      windowCount: window,
    });

    const kGramHandler = Winnowing?.arrKGramHandler({
      str: judul,
      kGramCount: kGram,
    });

    const windowHandler = Winnowing?.windowHandler({
      kGramCount: kGram,
      str: judul,
      windowCount: window,
    });

    const fingerPrintHandler = Winnowing?.fingerPrintHandler({
      kGramCount: kGram,
      str: judul,
      windowCount: window,
    });

    const roundUp2 = (num = 0) =>
      Math.ceil(num * Math.pow(10, 2)) / Math.pow(10, 2);

    res.status(200)?.send({
      status: 200,
      data: {
        ...(nip
          ? {
              arrPenelitianDosen,
            }
          : {
              ...(isGetAllWinnowing && {
                arrWinowing: sortArrObj({
                  arr: arrWinnowingValue,
                  props: "winnowingValue",
                  sortType: "DESC",
                })?.map((data) => ({
                  ...data,
                  winnowingValue: roundUp2(data?.winnowingValue),
                })),
              }),
              arrKGram: kGramHandler,
              arrWindow: windowHandler,
              fingerPrintHandler,
            }),
      },
    });

    // const arrWinnowingResult = allWinnowingDosen({
    //   dataPenelitian,
    // });
  } catch (e) {
    errResponse({ e, res });
  }
});

router.post("/getDetailUsulan", verifyJWT, async (req, res) => {
  const { id_usulan } = req.body;
  try {
    const getDataUsulan = await readFn({
      model: usulan,
      type: "all",
      usePaginate: false,
      isExcludeId: false,
      where: {
        id_usulan,
      },
      include: [
        {
          model: dosen,
          include: [
            {
              model: bidangModel,
              attributes: ["bidang"],
            },
            {
              model: penelitian,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
      exclude: ["createdAt", "updatedAt", "roles"],
    });

    const arrDatasUsulan = JSON.parse(JSON.stringify(getDataUsulan));

    const getDataMhs = await readFn({
      model: mhs,
      type: "find",
      usePaginate: false,
      where: {
        no_bp: arrDatasUsulan?.[0]?.no_bp,
      },
      exclude: ["password", "roles"],
      include: [
        {
          model: usulan,
          attributes: [
            "file_pra_proposal",
            "bidang",
            "jdl_from_dosen",
            "judul",
            "status_judul",
            "status_usulan",
            "tahun",
            "semester",
          ],
          where: {
            id_usulan,
          },
        },
      ],
      group: ["usulans.no_bp"],
    });

    const objDatasMhs = JSON.parse(JSON.stringify(getDataMhs));

    if (Object.keys(objDatasMhs)) {
      const getDatasDosen = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
        attributes: {
          exclude: ["createdAt", "updatedAt", "roles", "password"],
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("usulans.nip")),
              "n_mhs_usulan",
            ],
          ],
        },
        include: [
          {
            model: usulan,
            attributes: ["id"],
            include: [
              {
                model: mhs,
                attributes: {
                  exclude: ["password", "roles", "name"],
                },
                where: {
                  semester: objDatasMhs?.semester,
                },
              },
            ],
          },
        ],
        group: ["dosen.nip"],
      });

      const getMhsBimbingan = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
        attributes: {
          exclude: ["createdAt", "updatedAt", "roles", "password"],
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("usulans.nip")),
              "n_mhs_bimbingan",
            ],
          ],
        },
        include: [
          {
            model: usulan,
            attributes: ["id"],
          },
        ],
        group: ["nip"],
        where: {
          "$usulans.status_judul$": { [Op.ne]: ["usulan"] },
          "$usulans.status_usulan$": "confirmed",
        },
      });

      const getDataBidang = await readFn({
        model: bidangModel,
        usePaginate: false,
      });
      const getDataPenelitian = await readFn({
        model: penelitian,
        usePaginate: false,
      });

      const arrDatasBidang = JSON.parse(JSON.stringify(getDataBidang));
      const arrDatasPenelitian = JSON.parse(JSON.stringify(getDataPenelitian));

      const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));
      const arrMhsBimbingan = JSON.parse(JSON.stringify(getMhsBimbingan));

      const arrDatas = [];

      arrDatasUsulan?.forEach((usul) => {
        arrDatasDosen?.forEach((dosen) => {
          if (usul?.nip === dosen?.nip) {
            arrDatas?.push(dosen);
          }
        });
      });

      const allArrDatas = [...arrDatas, ...arrMhsBimbingan];
      const objPerAllArrDatas = {};
      allArrDatas?.forEach((data) => {
        if (!objPerAllArrDatas[data?.nip]) {
          objPerAllArrDatas[data?.nip] = {
            ...data,
            n_mhs_bimbingan: 0,
          };
        }
        objPerAllArrDatas[data?.nip]["n_mhs_bimbingan"] =
          data?.n_mhs_bimbingan ||
          objPerAllArrDatas[data?.nip]?.n_mhs_bimbingan;
      });

      // ini smua dosen, biar perhitungan n_mhs_bimbingannya g keliru
      // smua dosen itu karna data dari arrMhsBimbingan
      const arrDatasWithMhsBimbingan = Object.values(objPerAllArrDatas);

      const nipUsulan = arrDatas?.map((data) => data?.nip);

      // karna smua dosen, jdi difilter lgi hanya berdasarkan nip yg di usulan seorang mhs
      const filterArrDsnBimbingan = arrDatasWithMhsBimbingan?.filter((data) =>
        nipUsulan?.includes(data?.nip)
      );

      // filter data bidang dan penelitian hanya berdasarkan dosen yang diusulkan
      const filterBidang = arrDatasBidang?.filter((bdg) =>
        nipUsulan.includes(bdg?.nip)
      );
      const filterPenelitian = arrDatasPenelitian?.filter((pnltn) =>
        nipUsulan.includes(pnltn?.nip)
      );

      // tambahkan data bidang dan penelitian pada data dosen berdasarkan masing-masing dari nip dosen
      const dataDosenUsulan = filterArrDsnBimbingan?.map((bmbngan) => {
        return {
          ...bmbngan,
          bidangs: filterBidang?.filter((data) => data?.nip === bmbngan?.nip),
          penelitians: filterPenelitian?.filter(
            (data) => data?.nip === bmbngan?.nip
          ),
        };
      });

      const dosenJdlFromDosen = arrDatasDosen?.find(
        (data) => data?.nip === objDatasMhs?.usulans?.[0]?.jdl_from_dosen
      );

      // query hanya untuk dptkan info tahun dan semester mengenai si usulan
      const getThnSmster = await readFn({
        model: usulan,
        where: {
          id_usulan,
        },
        attributes: ["tahun", "semester"],
        type: "find",
      });

      res?.status(200)?.send({
        status: 200,
        data: {
          // arrDatas: filterArrDsnBimbingan,
          tahun: getThnSmster?.tahun,
          semester: getThnSmster?.semester,
          arrDatas: dataDosenUsulan,
          no_bp: objDatasMhs?.no_bp,
          statusUsulan: objDatasMhs?.usulans?.[0]?.status_usulan,
          mhs_name: objDatasMhs?.name,
          bidang: objDatasMhs?.usulans?.[0]?.bidang,
          // jdl_from_dosen: objDatasMhs?.usulans?.[0]?.jdl_from_dosen,
          judul: objDatasMhs?.usulans?.[0]?.judul,
          file_pra_proposal: objDatasMhs?.usulans?.[0]?.file_pra_proposal,
          ...(Object.keys(dosenJdlFromDosen || [])?.length && {
            jdl_from_dosen: {
              name: dosenJdlFromDosen?.name,
              nip: dosenJdlFromDosen?.nip,
            },
          }),
        },
      });
    } else {
      res?.status(404)?.send({
        status: 404,
        error: `No. Bp ${arrDatasUsulan?.[0]?.no_bp} tidak ditemukan`,
      });
    }
    // res.status(200).send({ status: 200, message: "s" });
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getDataBidang", async (req, res) => {
  try {
    const getDatasBidang = await readFn({
      model: bidangModel,
      type: "all",
      usePaginate: false,
      group: ["bidang"],
      attributes: ["bidang"],
    });
    const arrDatasBidang = JSON.parse(JSON.stringify(getDatasBidang));

    if (arrDatasBidang?.length) {
      res?.status(200)?.send({ status: 200, data: arrDatasBidang });
    } else {
      errResponse({
        e: "Data bidang kosong, mohon tambahkan data dosen",
        status: 400,
        res,
      });
    }
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/getSimilaritasJudul", async (req, res) => {
  const { judul_mhs } = req.body;
  try {
    const getDataJudul = await readFn({
      model: judulData,
      type: "all",
      usePaginate: false,
      isExcludeId: false,
      attributes: ["judul"],
    });

    const getDataUsulan = await readFn({
      model: usulan,
      usePaginate: false,
      type: "all",
      attributes: ["judul", "no_bp"],
    });

    const getDataSetting = await readFn({
      model: setting,
      usePaginate: false,
      type: "all",
    });

    const arrDataJudul = JSON.parse(JSON.stringify(getDataJudul));
    const arrDataUsulan = JSON.parse(JSON.stringify(getDataUsulan));

    const arrDataSetting = JSON.parse(JSON.stringify(getDataSetting));

    if (arrDataSetting?.length) {
      const judulDatas = uniqueArrObj({
        arr: [...arrDataJudul, ...arrDataUsulan],
        props: "judul",
      });

      const arrWinnowing = [];
      judulDatas?.forEach((dataJudul) => {
        const JSValue = jaccardSimilarityHandler({
          strJudulMhs: judul_mhs,
          strJudulPenelitian: dataJudul?.judul,
          kGramCount: arrDataSetting?.[0]?.kGram,
          windowCount: 3,
        });

        arrWinnowing?.push({
          judul: dataJudul?.judul,
          bidang: dataJudul?.bidang,
          tingkatan: dataJudul?.tingkatan,
          skor: JSValue,
        });
      });

      res.status(200).send({
        status: 200,
        data: sortArrObj({
          arr: arrWinnowing,
          props: "skor",
          sortType: "DESC",
        }),
      });
    } else {
      errResponse({ res, e: "Mohon berikan nilai kGram di setting" });
    }

    // jaccardSimilarityHandler;
  } catch (e) {
    errResponse({ res, e });
  }
});

// -CREATE-
router.post(
  "/addUsulan",
  verifyJWT,
  forbiddenResponseDosen,
  async (req, res) => {
    const { no_bp, nip } = req.body;
    try {
      const getSetting = await readFn({
        model: setting,
      });

      const objSetting = JSON.parse(JSON.stringify(getSetting))?.[0];

      const getDataMhs = await readFn({
        model: mhs,
        where: {
          no_bp,
        },
        type: "find",
        usePaginate: false,
        include: [usulan],
      });

      const dataMhs = JSON.parse(JSON.stringify(getDataMhs));

      const uuidVal = uuid();

      const arrDatas = nip?.map((dataNip) => {
        return {
          ...req?.body,
          nip: dataNip,
          status_judul: "usulan",
          id: uuid(),
          semester: dataMhs?.semester,
          tahun: dataMhs?.tahun,
          id_usulan: `${uuidVal}_${no_bp}`.toString(),
        };
      });

      /**
       * 1. fetch all cloudinary
       * 2. fetch all usulans by semester and tahun
       * 3. cari yg mana yg g kepake di cloudinary
       * 4. hapus yg cloudinary
       */
      const folderCloudinary = `SIDOS/PRA_PROPOSAL/${
        getDataMhs?.prodi
      }/${objSetting?.tahun?.replace("/", "_")}_${objSetting?.semester}`;

      // await sequelize.transaction(async (transaction) => {
      //   await multipleFn({
      //     model: usulan,
      //     arrDatas,
      //     type: "add",
      //     isTransaction: true,
      //     transaction,
      //   });
      // });

      multipleFn({
        model: usulan,
        arrDatas,
        type: "add",
      })?.then(() => {
        cloudinary.v2.api
          .resources({
            prefix: folderCloudinary,
            type: "upload",
          })
          ?.then(async ({ resources }) => {
            // ambil public_id dari cloudinary
            const arrPubIdCloudinary = resources?.map((data) => {
              const publicIdSplitted = data?.public_id?.split("/");
              return publicIdSplitted?.[publicIdSplitted?.length - 1];
            });

            // fetch all usulans by semester and tahun after add new usulan
            const getUsulanSemesterTahun = await readFn({
              model: usulan,
              where: {
                semester: objSetting?.semester,
                tahun: objSetting?.tahun,
              },
              usePaginate: false,
              type: "all",
            });

            const arrUsulanBySmstrThn = JSON.parse(
              JSON.stringify(getUsulanSemesterTahun)
            );

            // cari pub_id mana saja yg udh g kepake oleh si arrUsulanBySmstrThn
            const arrUnusedPubId = [];

            const pubIdUsulan = {};
            arrUsulanBySmstrThn?.forEach((data) => {
              const arrDataPraProposalSplit =
                data?.file_pra_proposal?.split("/");
              const pubId =
                arrDataPraProposalSplit?.[arrDataPraProposalSplit?.length - 1];
              const pubIdNoExt = pubId?.split(".")?.[0];

              pubIdUsulan[pubIdNoExt] = true;
            });

            arrPubIdCloudinary?.forEach((pubIdCld) => {
              if (!(pubIdCld in pubIdUsulan)) {
                arrUnusedPubId?.push(pubIdCld);
              }
            });

            // const uniqueUnusedPubId = uniqueArr({ arr: arrUnusedPubId });

            // delete yg udah g kepake
            arrUnusedPubId?.forEach((pubId) => {
              cloudinary.v2.uploader.destroy(`${folderCloudinary}/${pubId}`);
            });
          });

        res
          ?.status(200)
          ?.send({ status: 200, message: "Sukses nambah usulan" });
      });
    } catch (e) {
      errResponse({ res, e });

      // res?.status(400).send({ status: 400, error: e?.message });
    }
  }
);

// -UPDATE-
router.post(
  "/updateBimbingan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { nip, no_bp } = req.body;
    try {
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
      res
        .status(200)
        .send({ status: 200, message: "Update bimbingan berhasil" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

// -DELETE-
router.post("/deleteUsulan", verifyJWT, forbiddenResponse, async (req, res) => {
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
    errResponse({ res, e });
  }
});

router.post(
  "/restoreUsulan",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    try {
      const nRestore = await usulan.restore();
      if (nRestore !== 0) {
        res.send({ message: `Berhasil restore data sebayak ${nRestore}` });
      } else {
        throw new Error("Tidak ada data yg direstore");
      }
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

module.exports = {
  usulanRoute: router,
};
