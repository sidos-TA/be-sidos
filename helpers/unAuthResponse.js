const unAuthResponse = ({ res }) => {
  return res?.status(401)?.send({
    status: 401,
    error: "Login ulang",
  });
};

module.exports = unAuthResponse;
