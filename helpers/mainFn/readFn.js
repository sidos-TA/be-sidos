const readFn = ({
  model,
  where,
  type,
  page = 1,
  usePaginate = true,
  isExcludeId = true,
  ...props
}) => {
  if (type === "find") {
    return model.findOne({
      ...props,
      where,
      attributes: {
        ...props?.attributes,
        ...(isExcludeId && {
          exclude: ["id"],
        }),
      },
    });
  }

  return model.findAll({
    ...props,
    ...(where && {
      where,
    }),
    ...(usePaginate && {
      offset: page * 10 - 10,
      limit: 10,
    }),
    attributes: {
      ...props?.attributes,
      ...(isExcludeId && {
        exclude: ["id"],
      }),
    },
  });
};

module.exports = readFn;
