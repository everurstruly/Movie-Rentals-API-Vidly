const Joi = require("joi");
const { mongoDocSchemaDef, personSchemaDef } = require("../shared-schemas");
const { membershipRegistrantForm } = require("../membership-validator/schema");

const userRegistreeForm = {
  firstName: personSchemaDef.name,
  lastName: personSchemaDef.name,
  dateOfBirth: Joi.string().isoDate(),
  phoneNumber: Joi.number().phone(),
  memberships: Joi.array().min(1).items(membershipRegistrantForm.id),
};

const userSelfPatchForm = {
  ...registreeAdminForm,
};

const userCrossPatchForm = {
  ...userToRegister,
  isSuspended: Joi.boolean(),
};

const userRegistrantForm = {
  ...writableAdminSchemaDef,
  id: mongoDocSchemaDef.id,
};

const userAuthSessCred = {
  email: userRegistrantForm.email.required(),
  password: userRegistrantForm.password.min(0).required(),
};

const userAuthSessTokenPayload = {
  user: userSchemaDef.id.required(),
  age: Joi.number().min(1).required(),
  isBanned: userSchemaDef.isBanned.required(),
  memberships: userSchemaDef.memberships.required(),
};

module.exports = {
  userRegistreeForm,
  userCrossPatchForm,
  userRegistrantForm,
};
