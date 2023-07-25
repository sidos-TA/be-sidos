const decodeJWT = require("./decodeJWT");

const forbiddenResponse = (req, res, next) => {
  const dataJWT = decodeJWT({ req });

  if (dataJWT?.roles === 1) {
    next();
  } else {
    res?.status(403)?.send({
      status: 403,
      message: "Tak Dapat Akses",
    });
  }
};

module.exports = forbiddenResponse;
