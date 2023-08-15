const readFn = ({
  model,
  where,
  type,
  page = 1,
  usePaginate = true,
  isExcludeId = true,
  exclude = [],
  ...props
}) => {
  if (type === "find") {
    return model.findOne({
      where,
      attributes: {
        ...props?.attributes,
        exclude: [...exclude, "createdAt", "updatedAt", isExcludeId && "id"],
      },
      ...props,
    });
  }

  return model.findAll({
    ...(where && {
      where,
    }),

    attributes: {
      ...props?.attributes,
      exclude: [...exclude, isExcludeId && "id"],
    },
    ...(usePaginate && {
      offset: page * 10 - 10,
      limit: 10,
    }),
    ...props,
  });
};

module.exports = readFn;
