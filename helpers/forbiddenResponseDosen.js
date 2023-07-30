const decodeJWT = require("./decodeJWT");

const forbiddenResponseDosen = (req, res, next) => {
  const dataJWT = decodeJWT({ req });

  if (dataJWT?.roles === 2) {
    next();
  } else {
    res?.status(403)?.send({
      status: 403,
      error: "Tak Dapat Akses",
    });
  }
};

module.exports = forbiddenResponseDosen;
