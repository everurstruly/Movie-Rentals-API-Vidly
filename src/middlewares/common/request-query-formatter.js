const express = require("express");
const parseTypeInString = require("../../lib/parse-type-in-string");
const utilFuncs = require("../../utils");

const defaultConfig = {
  accessor: "dataProcessingOptions",
  format: {
    sorts: {
      qParamKey: "sort",
      qParamValueSeperator: ",",
      qParamValueDelimeter: ":",
    },
    filters: {
      qParamKey: "filter",
      qParamValueSeperator: ",",
      qParamValueDelimeter: ":",
      qParamChoicesDelimeter: "/",
    },
    pagination: {
      qParamKey: "page",
      qParamValueSeperator: ",",
      qParamValueDelimeter: ":",
    },
    payload: {
      qParamKeysPrefix: "",
      qParamKeys: [
        { name: "limit", default: 100 },
        { name: "offset", default: 0 },
      ],
    },
  },
  sortOrders: {
    ascending: "asc",
    descending: "dsc",
  },
  operators: {
    logical: {
      prefix: "$",
      and: "and",
      or: "and",
    },
    conditional: {
      prefix: "$",
      in: "in",
      nin: "nin",
    },
    comparison: {
      prefix: "$",
      equal: "eq",
      notEqual: "ne",
      greaterOrEqual: "gte",
      lessOrEqual: "lte",
      greaterThan: "gt",
      lessThan: "lt",
    },
  },
};

const parseTypeInStr = parseTypeInString();
const prettifyQParamValue = (value, seperator) => {
  return value
    .split(seperator)
    .map((v) => v.trim())
    .filter((v) => v);
};

const getSortProcess = (queryString, format, orders) => {
  const { qParamKey, qParamValueSeperator, qParamValueDelimeter } = format;
  const qParamValue = queryString[qParamKey] || "";
  const sorts = prettifyQParamValue(qParamValue, qParamValueSeperator);
  const defaultOrder = orders.ascending;
  return sorts.map((sortBy) => {
    const [field, order = defaultOrder] = sortBy.split(qParamValueDelimeter);
    return { field, order };
  });
};

const getFilterProcess = (queryString, format, operators) => {
  const {
    qParamKey,
    qParamValueSeperator,
    qParamValueDelimeter,
    qParamChoicesDelimeter,
  } = format;

  const qParamValue = queryString[qParamKey] || "";
  const qParamValues = Array.isArray(qParamValue) ? qParamValue : [qParamValue];
  const {
    logical: logicalOp,
    comparison: comparisonOp,
    conditional: conditionalOp,
  } = operators;

  const conditionalOperators = Object.values(conditionalOp)
    .filter((value) => value !== conditionalOp.prefix)
    .map((name) => conditionalOp.getOperator(name));

  const getFilterBy = (query) => {
    const filterBy = query.split(qParamValueDelimeter);
    const hasOperator = filterBy.length === 3 ? true : false;
    const field = filterBy[0];
    const valueToParse = hasOperator ? filterBy[2] : filterBy[1];
    const choicesToParse = prettifyQParamValue(
      valueToParse,
      qParamChoicesDelimeter
    );

    const operator = hasOperator
      ? filterBy[1]
      : comparisonOp.getOperator("equal");

    const parsedValue = parseTypeInStr(valueToParse);
    const parsedChoices = choicesToParse.map((c) => parseTypeInStr(c));
    const hasConditionalOperator = conditionalOperators.includes(operator);
    const value = hasConditionalOperator ? parsedChoices : parsedValue;
    return { field, operator, value };
  };

  return qParamValues.reduce((process, qParamValue) => {
    const qParamValueChunks = qParamValue.split(qParamValueDelimeter);
    const firstQParamChunk = qParamValueChunks[0];
    const hasLogicalOperator = firstQParamChunk.startsWith(logicalOp.prefix);
    const logicalOperator = hasLogicalOperator
      ? firstQParamChunk
      : logicalOp.getOperator("and");

    const logicalOperand = qParamValueChunks
      .slice(hasLogicalOperator ? 1 : 0)
      .join(qParamValueDelimeter);

    const filters = prettifyQParamValue(logicalOperand, qParamValueSeperator);
    if (utilFuncs.isEmptyArray(filters)) return process;
    process[logicalOperator] = filters.map((q) => getFilterBy(q));
    return process;
  }, {});
};

const getPaginationProcess = (queryString, format) => {
  const { qParamKey, qParamValueSeperator, qParamValueDelimeter } = format;
  let qParamValue = queryString[qParamKey] || "";
  if (Array.isArray(qParamValue)) {
    qParamValue = qParamValue.join(qParamValueSeperator);
  }

  const pagination = prettifyQParamValue(qParamValue, qParamValueSeperator);
  return pagination.reduce((process, paginateBy) => {
    if (!paginateBy) return process;
    const [attr, value] = paginateBy.split(qParamValueDelimeter);
    process[attr] = parseTypeInStr(value);
    return process;
  }, {});
};

const getPayloadProcess = (queryString, format) => {
  const { qParamKeysPrefix, qParamKeys } = format;
  return qParamKeys.reduce((process, key) => {
    const { name: qParamKey, default: qParamDefaultValue } = key;
    const qParamValue = queryString[`${qParamKeysPrefix}${qParamKey}`]?.trim();
    process[qParamKey] = parseTypeInStr(qParamValue || qParamDefaultValue);
    return process;
  }, {});
};

const reqQueryFormatter = (config) => (req, res, next) => {
  for (const operation in config.operators) {
    config.operators[operation].getOperator = function (name) {
      const value = this[name];
      if (!value) return "";
      return `${this.prefix}${value}`;
    };
  }

  const queryString = req.query;
  const { operators, format } = config;

  req[config.accessor] = {
    sorts: getSortProcess(queryString, format.sorts, config.sortOrders),
    filters: getFilterProcess(queryString, format.filters, operators),
    pagination: getPaginationProcess(queryString, format.pagination),
    payload: getPayloadProcess(queryString, format.payload),
  };

  return next();
};

const router = express.Router();
module.exports = (accessor, config = {}) => {
  const computedConfig = { ...defaultConfig };
  if (accessor) computedConfig.accessor = accessor;

  const updateConfigOptions = (key) => {
    for (const options of Object.keys(defaultConfig[key])) {
      utilFuncs.updateValuesFromProperties(
        computedConfig[key][options],
        config[key]?.[options]
      );
    }
  };

  updateConfigOptions("format");
  updateConfigOptions("operators");
  updateConfigOptions("sortOrders");
  router.use(reqQueryFormatter(computedConfig));
  return router;
};
