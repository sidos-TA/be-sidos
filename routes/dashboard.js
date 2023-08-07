const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { mhs, usulan, setting } = require("../models");
const errResponse = require("../helpers/errResponse");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const verifyJWT = require("../helpers/verifyJWT");

router.post(
  "/dashboardUsulanMhs",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const getFullYear = new Date().getFullYear();
    const { tahun = getFullYear, semester } = req.body;
    try {
      const getDataSettings = await readFn({
        model: setting,
        type: "all",
      });

      if (getDataSettings?.length) {
        const getDatasMhs = await readFn({
          model: mhs,
          type: "all",
          usePaginate: false,
          attributes: ["name", "no_bp", "semester", "tahun"],
          include: [
            {
              model: usulan,
              attributes: ["judul"],
            },
          ],
          where: {
            tahun,
            semester: semester || getDataSettings?.[0]?.semester,
          },
          group: ["no_bp"],
        });
        const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

        const filteredDatasMhs = (isAda) => {
          if (isAda) {
            return arrDatasMhs?.filter((data) => data?.usulans?.length)?.length;
          }
          return arrDatasMhs?.filter((data) => !data?.usulans?.length)?.length;
        };

        const arrDatasGraphUsulanMhs = [
          {
            title: "Telah mengusulkan",
            value: filteredDatasMhs(true),
            color: "green",
          },
          {
            title: "Belum mengusulkan",
            value: filteredDatasMhs(false),
            color: "grey",
          },
        ];

        res.status(200).send({
          status: 200,
          data: arrDatasGraphUsulanMhs,
          getFullYear,
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
  }
);

router.post(
  "/dashboardStatusJudul",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    const getFullYear = new Date().getFullYear();
    const { tahun = getFullYear, semester } = req.body;
    try {
      const getDataSettings = await readFn({
        model: setting,
        type: "all",
      });

      if (getDataSettings?.length) {
        const getDatasMhs = await readFn({
          model: mhs,
          type: "all",
          usePaginate: false,
          attributes: ["name"],
          include: [
            {
              model: usulan,
              attributes: ["status_judul"],
            },
          ],
          group: ["no_bp"],
          where: {
            tahun,
            semester: semester || getDataSettings?.[0]?.semester,
          },
        });

        const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

        const lengthStatusJudul = (statusJudul) => {
          const statusJudulValLength = arrDatasMhs?.filter(
            (mhs) => mhs?.usulans[0]?.status_judul === statusJudul
          ).length;

          return statusJudulValLength;
        };

        const arrDatasGraphStatusJudul = [
          {
            title: "Terima",
            value: lengthStatusJudul("terima"),
            color: "green",
          },
          {
            title: "Tolak",
            value: lengthStatusJudul("tolak"),
            color: "red",
          },
          {
            title: "Usulan",
            value: lengthStatusJudul("usulan"),
            color: "yellow",
          },
          {
            title: "Revisi",
            value: lengthStatusJudul("revisi"),
            color: "grey",
          },
          {
            title: "Belum mengajukan",
            value: lengthStatusJudul(),
            color: "red",
          },
        ];

        res.status(200).send({
          status: 200,
          data: arrDatasGraphStatusJudul,
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
  }
);

module.exports = { dashboardRoute: router };
