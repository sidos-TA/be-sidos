const router = require("./router");

router.get("/tes", (req, res) => {
  res.status(200).send({ status: 200, message: "Berhasil" });
});

module.exports = { tesRoute: router };
