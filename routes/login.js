const router = require("./router");
const { mhs, dosen } = require("../models");
const readFn = require("../helpers/mainFn/readFn");
const { Op } = require("sequelize");
const comparedPassword = require("../helpers/comparedPassword");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    // apakah ada data user dan password

    const getDataMhs = await readFn({
      model: mhs,
      type: "find",
      usePaginate: false,
      where: {
        [Op.or]: [{ no_bp: username }, { username }],
      },
    });
    const getDataDosen = await readFn({
      model: dosen,
      type: "find",
      usePaginate: false,
      where: {
        [Op.or]: [{ nip: username }, { username }],
      },
    });

    const loginHandler = async (dataType, nipOrnobp) => {
      const isPasswordValid = await comparedPassword(
        password,
        dataType?.password
      );
      if (isPasswordValid) {
        const token = await jwt.sign(
          {
            username,
            roles: dataType?.roles,
            [nipOrnobp]: dataType?.[nipOrnobp],
          },
          process.env.JWT_SECRET_KEYS,
          // { expiresIn: process.env.JWT_EXPIRES_IN },
          { expiresIn: 30 },
          { algorithm: "RS256" }
        );

        res.send({ status: 200, message: "sukses login", token });
      } else {
        res.status(401)?.send({ status: 400, error: "Salah password" });
      }
    };

    if (getDataMhs) {
      loginHandler(getDataMhs, "no_bp");
    } else if (getDataDosen) {
      loginHandler(getDataDosen, "nip");
    } else {
      res.status(400)?.send({ status: 400, error: "Ga ada data" });
    }
  } else {
    res.send("masukkan username dan password");
  }
});

module.exports = { loginRoute: router };
