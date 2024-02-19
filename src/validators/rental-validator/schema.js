const Joi = require("joi");
const { mongoDocSchemaDef } = require("../shared-schemas");
const { movieRegistrantForm } = require("../movie-validator/schema");
const { userRegistrantForm } = require("../user-validator/schema");
const { adminRegistrantForm } = require("../admin-validator/schema");

const rentalRegistreeForm = {
  user: userRegistrantForm.id,
  movies: Joi.array().items(movieRegistrantForm.id).min(1),
  priceCharged: Joi.number().min(0),
};

const rentalCrossPatchForm = {
  ...rentalRegistreeForm,
};

const modificationInfo = {
  byAdmin: adminRegistrantForm.id,
  at: Joi.string().isoDate(),
};

const nullOrDateValue = Joi.any().custom((value, helpers) => {
  if (!Joi.string().isoDate().validate(value).error || value === null) {
    return value;
  }

  throw new Error("Value can be an iso-formatted-date or null only");
});

const rentalRegistrantForm = {
  ...rentalCrossPatchForm,
  id: mongoDocSchemaDef.id,
  out: { ...modificationInfo },
  return: {
    ...modificationInfo,
    at: Joi.string().isoDate().allow(null),
    expectedAt: Joi.string().isoDate(),
  },
  lastModified: { ...modificationInfo },
};

module.exports = {
  rentalRegistreeForm,
  rentalCrossPatchForm,
  rentalRegistrantForm,
};
