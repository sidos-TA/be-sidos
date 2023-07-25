const unAuthResponse = ({ res }) => {
  return res?.status(401)?.send({
    status: 401,
    message: "Login ulang",
  });
};

module.exports = unAuthResponse;
