const errResponse = require("../helpers/errResponse");
const readFn = require("../helpers/mainFn/readFn");
const router = require("./router");
const { bidang, dosen } = require("../models");

router.post("/getBidang", async (req, res) => {
  try {
    const getDatasBidang = await readFn({
      model: bidang,
      type: "all",
      include: [
        {
          model: dosen,
          attributes: ["name", "nip"],
        },
      ],
    });

    const arrDatasBidang = JSON.parse(JSON.stringify(getDatasBidang));

    res.status(200).send({ status: 200, data: arrDatasBidang });
  } catch (e) {
    errResponse({ res, e });
  }
});
