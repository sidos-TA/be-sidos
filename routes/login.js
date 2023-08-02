const router = require("./router");
const { mhs, dosen } = require("../models");
const readFn = require("../helpers/mainFn/readFn");
const { Op } = require("sequelize");
const comparedPassword = require("../helpers/comparedPassword");
const jwt = require("jsonwebtoken");
const errResponse = require("../helpers/errResponse");
const updateFn = require("../helpers/mainFn/updateFn");
const verifyJWT = require("../helpers/verifyJWT");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (username && password) {
      // apakah ada data user dan password

      const getDataMhs = await readFn({
        model: mhs,
        type: "find",
        usePaginate: false,
        where: {
          no_bp: username,
        },
      });
      const getDataDosen = await readFn({
        model: dosen,
        type: "find",
        usePaginate: false,
        where: {
          nip: username,
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
              name: dataType?.name,
              roles: dataType?.roles,
              [nipOrnobp]: dataType?.[nipOrnobp],
              ...(nipOrnobp === "no_bp" && {
                is_usul: dataType?.is_usul,
              }),
            },
            process.env.JWT_SECRET_KEYS,
            { expiresIn: Number(process.env.JWT_EXPIRES_IN) },
            // { expiresIn: 3600 },
            { algorithm: "RS256" }
          );

          res.send({
            status: 200,
            message: "Sukses login",
            token,
          });
        } else {
          res.status(401)?.send({ status: 401, error: "Salah password" });
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
  } catch (e) {
    errResponse({ res, e });
  }
});

router.post("/change_password", verifyJWT, async (req, res) => {
  const { new_password, old_password } = req.body;
  try {
    const nipOrNoBp = "nip" in req.body ? "nip" : "no_bp";
    const model = "nip" in req.body ? dosen : mhs;

    const objDataUser = await readFn({
      model,
      type: "find",
      where: {
        [nipOrNoBp]: req.body?.[nipOrNoBp],
      },
      usePaginate: false,
    });

    const isPasswordValid = await comparedPassword(
      old_password,
      objDataUser?.password
    );

    if (isPasswordValid) {
      await updateFn({
        model: dosen,
        data: {
          password: new_password,
        },
        where: {
          [nipOrNoBp]: req.body?.[nipOrNoBp],
        },
      });
      res.status(200)?.send({ status: 200, message: "Sukses update password" });
    } else {
      res
        .status(404)
        ?.send({ status: 404, error: "Password yang lama tidak sesuai" });
    }
  } catch (e) {
    errResponse({ e, res });
  }
});

module.exports = { loginRoute: router };
