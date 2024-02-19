const Joi = require("joi");
const { mongoDocSchemaDef } = require("../shared-schemas");

const genreRegistreeForm = {
  title: Joi.string(),
};

const genreCrossPatchForm = {
  ...genreRegistreeForm,
  isDiscontinued: Joi.boolean(),
};

const genreRegistrantForm = {
  ...writableAdminSchemaDef,
  id: mongoDocSchemaDef.id,
};

module.exports = {
  genreRegistreeForm,
  genreCrossPatchForm,
  genreRegistrantForm,
};
