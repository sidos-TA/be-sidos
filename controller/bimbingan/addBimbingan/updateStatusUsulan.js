const multipleFn = require("../../../helpers/mainFn/multipleFn");
const updateFn = require("../../../helpers/mainFn/updateFn");
const { usulan } = require("../../../models");

const updateStatusUsulan = async ({ status_usulan, arrDatas, no_bp }) => {
  arrDatas?.forEach((objData) => {
    updateFn({
      model: usulan,
      data: {
        ...objData,
        status_usulan,
      },
      where: {
        no_bp,
      },
    });
  });
  // return await multipleFn({
  //   model: usulan,
  //   arrDatas: arrDatas?.map((data) => ({
  //     ...data,
  //     status_usulan,
  //   })),
  //   type: "update",
  // });
};

module.exports = { updateStatusUsulan };
