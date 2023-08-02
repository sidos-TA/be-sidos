const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { mhs } = require("../models");
const errResponse = require("../helpers/errResponse");
const randomColors = require("../helpers/randomColors");
const forbiddenResponse = require("../helpers/forbiddenResponse");
const verifyJWT = require("../helpers/verifyJWT");

router.post(
  "/dashboardUsulanMhs",
  verifyJWT,
  forbiddenResponse,
  async (req, res) => {
    try {
      const getDatasMhs = await readFn({
        model: mhs,
        type: "all",
        usePaginate: false,
      });
      const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));

      const filteredDatasMhs = (statusUsul) => {
        return arrDatasMhs?.filter((data) => data?.is_usul === statusUsul);
      };

      const arrDatasGraphUsulanMhs = [
        {
          title: "Telah mengusulkan",
          value: filteredDatasMhs(true)?.length,
          color: "green",
        },
        {
          title: "Belum mengusulkan",
          value: filteredDatasMhs(false)?.length,
          color: "grey",
        },
      ];

      res.status(200).send({
        status: 200,
        data: arrDatasGraphUsulanMhs,
      });
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
    try {
      const getDatasMhs = await readFn({
        model: mhs,
        type: "all",
        usePaginate: false,
        // where: {
        //   is_usul: true,
        // },
      });
      const arrDatasMhs = JSON.parse(JSON.stringify(getDatasMhs));
      const filteredDatasMhs = (statusJudul) => {
        return arrDatasMhs?.filter(
          (data) => data?.status_judul === statusJudul
        );
      };

      const arrDatasGraphStatusJudul = [
        {
          title: "Terima",
          value: filteredDatasMhs("terima")?.length,
          color: "green",
        },
        {
          title: "Tolak",
          value: filteredDatasMhs("tolak")?.length,
          color: "red",
        },
        {
          title: "Usulan",
          value: filteredDatasMhs("usulan")?.length,
          color: "yellow",
        },
        {
          title: "Belum mengajukan",
          value: filteredDatasMhs("belum mengajukan")?.length,
          color: "grey",
        },
      ];

      res.status(200).send({
        status: 200,
        data: arrDatasGraphStatusJudul,
        arrDatasMhs,
      });
    } catch (e) {
      errResponse({ res, e });
    }
  }
);

module.exports = { dashboardRoute: router };
