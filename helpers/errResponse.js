const errResponse = ({ res, e, status = 400 }) => {
  const parentCode = e?.parent?.code;
  if (parentCode === "ECONNREFUSED") {
    return res?.status(400)?.send({
      status,
      error: "Terdapat kesalahan server",
    });
  } else if (parentCode === "ER_DUP_ENTRY") {
    return res?.status(400)?.send({
      status,
      error: "Data telah ada",
    });
  }
  return res?.status(status)?.send({
    status,
    error: Object?.keys(e || [])?.length ? e : e?.message,
  });
};

module.exports = errResponse;
