const errResponse = require("../helpers/errResponse");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const updateFn = require("../helpers/mainFn/updateFn");
const verifyJWT = require("../helpers/verifyJWT");
const router = require("./router");
const { setting } = require("../models");
const readFn = require("../helpers/mainFn/readFn");

// -READ-
router.post("/getSetting", verifyJWT, async (req, res) => {
  try {
    const getDataSetting = await readFn({
      model: setting,
      isExcludeId: false,
      type: "all",
      usePaginate: false,
    });
    const arrDataSetting = JSON.parse(JSON.stringify(getDataSetting));

    res.status(200).send({ status: 200, data: arrDataSetting?.[0] });
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

module.exports = { settingRoute: router };
