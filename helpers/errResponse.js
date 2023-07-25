const errResponse = ({ res, e }) => {
  return res?.status(400)?.send({
    status: 400,
    error: Object?.keys(e)?.length ? e : e?.message,
  });
};

module.exports = errResponse;
