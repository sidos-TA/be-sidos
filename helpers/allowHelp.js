const decodeJWT = require("./decodeJWT");

const allowHelp = (req, res, next) => {
  const dataJWT = decodeJWT({ req });

  if (dataJWT?.roles === 1 || dataJWT?.roles === 3) {
    next();
  } else {
    res?.status(403)?.send({
      status: 403,
      error: "Tak Dapat Akses",
    });
  }
};

module.exports = allowHelp;
