const Joi = require("joi");
const { mongoDocSchemaDef, personSchemaDef } = require("../shared-schemas");
const { RoleSchema } = require("./role-validator/schema");

class AdminSchema {
  registreeForm = {
    firstName: personSchemaDef.name,
    lastName: personSchemaDef.name,
    dateOfBirth: Joi.string().isoDate(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(1024),
    assignedRolesIds: Joi.array().min(1).items(RoleSchema.registrantForm.id),
  };

  selfPatchForm = {
    ...this.registreeForm,
  };

  crossPatchForm = {
    ...this.registreeForm,
    isSuspended: Joi.boolean(),
  };

  registrantForm = {
    ...this.registreeForm,
    id: mongoDocSchemaDef.id,
    displayName: Joi.string().hex(),
  };

  authSessCred = {
    email: this.registrantForm.email.required(),
    password: this.registrantForm.password.min(0).required(),
  };

  authSessTokenPayload = {
    admin: this.registrantForm.id.required(),
    isSuspended: this.registrantForm.isSuspended.required(),
    assignedRolesIds: this.registrantForm.assignedRolesIds.required(),
  };
}

class AdminValidator {
  // code goes here
  
}

module.exports = { AdminSchema, AdminValidator };
