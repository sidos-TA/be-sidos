const errResponse = require("../helpers/errResponse");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const updateFn = require("../helpers/mainFn/updateFn");
const verifyJWT = require("../helpers/verifyJWT");
const router = require("./router");
const { setting, dosen, tahuns } = require("../models");
const readFn = require("../helpers/mainFn/readFn");
const multipleFn = require("../helpers/mainFn/multipleFn");
const { uuid } = require("uuidv4");
const deleteFn = require("../helpers/mainFn/deleteFn");

// -READ-
router.post("/getSetting", async (req, res) => {
  try {
    const getDataSetting = await readFn({
      model: setting,
      isExcludeId: false,
      type: "all",
      usePaginate: false,
      exclude: ["createdAt", "updatedAt"],
    });
    const arrDataSetting = JSON.parse(JSON.stringify(getDataSetting));
    if (arrDataSetting?.length) {
      res.status(200).send({ status: 200, data: arrDataSetting?.[0] });
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

router.post("/getTahun", async (req, res) => {
  try {
    const getSettingTahun = await readFn({
      model: tahuns,
      attributes: ["tahun"],
      order: [["tahun", "ASC"]],
    });
    res?.status(200).send({ status: 200, data: getSettingTahun });
  } catch (e) {
    errResponse({ res, e });
  }
});

// -UPDATE-
router.post(
  "/updateSettings",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { id } = req.body;
    try {
      await updateFn({
        model: setting,
        data: req.body,
        where: {
          id,
        },
      });
      res.status(200)?.send({ status: 200, message: "Sukses update setting" });
    } catch (e) {
      errResponse({ e, res });
    }
  }
);

router.post(
  "/updateSettingTahun",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { arrDatas } = req.body;

    try {
      const getDataTahun = await readFn({
        model: tahuns,
        isExcludeId: false,
      });
      const arrDataTahun = JSON.parse(JSON.stringify(getDataTahun));

      deleteFn({
        model: tahuns,
        where: {
          id: arrDataTahun?.map((data) => data?.id),
        },
      })?.then(async () => {
        await multipleFn({
          model: tahuns,
          type: "add",
          arrDatas: arrDatas?.map((data) => ({
            ...data,
            id: uuid(),
          })),
        });
      });

      res
        .status(200)
        ?.send({ status: 200, message: "Sukses update data tahun akademik" });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

router.post(
  "/updateKaprodi",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const { kaprodi } = req.body;
    try {
      const getDatasDosen = await readFn({
        model: dosen,
        type: "all",
        usePaginate: false,
      });

      const arrDatasDosen = JSON.parse(JSON.stringify(getDatasDosen));

      const arrNotUpdatedDosen = arrDatasDosen
        ?.filter((dosen) => !kaprodi?.includes(dosen?.nip))
        ?.map((dosen) => dosen?.nip);

      if (kaprodi?.length) {
        kaprodi?.forEach((nip) => {
          updateFn({
            model: dosen,
            where: {
              nip,
            },
            data: {
              roles: 1,
            },
          });
        });

        arrNotUpdatedDosen?.forEach((nip) => {
          updateFn({
            model: dosen,
            where: {
              nip,
            },
            data: {
              roles: null,
            },
          });
        });
        res.status(200).send({
          status: 200,
          message: "Sukses update data kaprodi",
          arrNotUpdatedDosen,
        });
      } else {
        errResponse({
          res,
          e: "Mohon pilih setidaknya 1 dosen untuk menjadi Kaprodi",
        });
      }
    } catch (e) {
      errResponse({ e, res });
    }
  }
);
module.exports = { settingRoute: router };
