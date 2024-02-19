const Joi = require("joi");
const { mongoDocSchemaDef } = require("../shared-schemas");
const { genreRegistrantForm } = require("../genre-validator/schema");

const movieRegistreeForm = {
  title: Joi.string(),
  genres: Joi.array().min(1).items(genreRegistrantForm.id),
  numberInStock: Joi.number().min(0),
  audienceMinAge: Joi.number().min(1),
  rentalPrice: Joi.number().min(0),
};

const movieCrossPatchForm = {
  ...movieToRegister,
  isBanned: Joi.boolean(),
};

const movieRegistrantForm = {
  ...writableAdminSchemaDef,
  id: mongoDocSchemaDef.id,
};

module.exports = {
  movieRegistreeForm,
  movieCrossPatchForm,
  movieRegistrantForm,
};
