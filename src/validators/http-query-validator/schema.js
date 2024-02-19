const Joi = require("joi");
const constants = require("../lib/constants");

const { DATA_PROCESSING_OPTIONS } = constants;

const bitwiseOperators = Object.values(
  DATA_PROCESSING_OPTIONS.FILTER_OPERATORS.BITWISE
);

const membershipOperators = Object.values(
  DATA_PROCESSING_OPTIONS.FILTER_OPERATORS.MEMBERSHIP
);

const comparisonOperators = Object.values(
  DATA_PROCESSING_OPTIONS.FILTER_OPERATORS.COMPARISON
);

const nonBitwiseOperators = [...membershipOperators, ...comparisonOperators];
const sortOrders = Object.values(DATA_PROCESSING_OPTIONS.SORT_ORDERS);

const dataProcOptionsForm = {
  sorts: Joi.array().items(
    Joi.array().ordered(
      Joi.string().required(),
      Joi.string()
        .valid(...sortOrders)
        .required()
    )
  ),
  filters: Joi.object().pattern(Joi.string().valid(...bitwiseOperators), [
    Joi.array().items(
      Joi.object().pattern(Joi.string(), [
        Joi.object().pattern(Joi.string().valid(...nonBitwiseOperators), [
          Joi.string(),
          Joi.number(),
          Joi.boolean(),
          Joi.string().isoDate(),
        ]),
      ])
    ),
  ]),
  pagination: Joi.object().pattern(Joi.string(), [
    Joi.number().required(),
    Joi.valid("undefined"),
  ]),
  payload: Joi.object().pattern(Joi.string(), [
    Joi.number().required(),
    Joi.valid("undefined"),
  ]),
};

module.exports = {
  dataProcOptionsForm,
};
