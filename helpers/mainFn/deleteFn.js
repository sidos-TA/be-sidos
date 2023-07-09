const deleteFn = ({
  model,
  where,
  isTransaction = false,
  transaction,
  ...props
}) => {
  return model.destroy(
    {
      where,
      ...props,
    },
    isTransaction && { transaction }
  );
};

module.exports = deleteFn;
