const errResponse = ({ res, e, status = 400 }) => {
  return res?.status(status)?.send({
    status,
    error: Object?.keys(e)?.length ? e : e?.message,
  });
};

module.exports = errResponse;
