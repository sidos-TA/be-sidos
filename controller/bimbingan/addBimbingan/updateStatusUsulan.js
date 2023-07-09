const multipleFn = require("../../../helpers/mainFn/multipleFn");
const { usulan } = require("../../../models");

const updateStatusUsulan = async ({ status_usulan, arrDatas }) => {
  return await multipleFn({
    model: usulan,
    arrDatas: arrDatas?.map((data) => ({
      ...data,
      status_usulan,
    })),
    type: "update",
  });
};

module.exports = { updateStatusUsulan };
