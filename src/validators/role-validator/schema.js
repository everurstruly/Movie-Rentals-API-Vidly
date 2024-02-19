const Joi = require("joi");
const { mongoDocSchemaDef } = require("../shared-schemas");

const roleRegistreeForm = {
  title: Joi.string(),
  level: Joi.number().min(1),
};

const roleCrossPatchForm = {
  ...roleRegistreeForm,
  isDiscontinued: Joi.boolean(),
};

const roleRegistrantForm = {
  ...writableAdminSchemaDef,
  id: mongoDocSchemaDef.id,
};

module.exports = {
  roleRegistreeForm,
  roleCrossPatchForm,
  roleRegistrantForm,
};
