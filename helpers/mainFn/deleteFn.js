const deleteFn = ({
  model,
  where,
  isTransaction = false,
  transaction,
  type,
  ...props
}) => {
  if (type === "all") {
    return model.destroyAll();
  }
  return model.destroy(
    {
      ...(where && {
        where,
      }),
      ...props,
    },
    isTransaction && { transaction }
  );
};

module.exports = deleteFn;
