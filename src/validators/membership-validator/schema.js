const Joi = require("joi");
const { mongoDocSchemaDef } = require("../shared-schemas");

const membershipRegistreeForm = {
  title: Joi.string(),
};

const membershipCrossPatchForm = {
  ...membershipRegistreeForm,
  isDiscontinued: Joi.boolean(),
};

const membershipRegistrantForm = {
  ...writableAdminSchemaDef,
  id: mongoDocSchemaDef.id,
};

module.exports = {
  membershipRegistreeForm,
  membershipCrossPatchForm,
  membershipRegistrantForm,
};
