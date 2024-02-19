
exports.mapToDbDataProcessingQueryModel = (query) => {
  const { sorts, filters } = query;
  const newSorts = sorts.map((sort) => [sort.field, sort.order]);
  const newFilters = Object.keys(filters).reduce((process, operator) => {
    const operand = filters[operator].map((operand) => {
      const { field, operator, value } = operand;
      return { [field]: { [operator]: value } };
    });

    process[operator] = operand;
    return process;
  }, {});

  return {
    ...query,
    sorts: newSorts,
    filters: newFilters,
  };
};

exports.getPaginationInfo = (pageNumber, pageSize, itemsTotalSize) => {
  const minPage = 1;
  const itemsPerPage = Math.min(pageSize || 5, itemsTotalSize);
  const totalPages = Math.ceil(itemsTotalSize / itemsPerPage);
  const currentPage = Math.min(pageNumber || minPage, totalPages);
  const paginateFrom = currentPage * itemsPerPage - 1;
  const paginateTo = paginateFrom + itemsPerPage;
  const nextPage = Math.min(currentPage + 1, totalPages);
  const prevPage = Math.max(currentPage - 1, minPage);

  return [
    {
      currentPage,
      totalPages,
      itemsPerPage,
      itemsTotalSize,
      nextPage,
      prevPage,
    },
    { paginateFrom, paginateTo },
  ];
};
