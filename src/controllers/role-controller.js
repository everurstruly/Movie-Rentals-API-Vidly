const Role = require("../models/role-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { requestUtils } = require("../lib/express-http-helpers");
const { searchDuplicateAndIssueReponse } = require("./common.js");

exports.readRoles = asyncRouteHandler(async (_, res) => {
  const rolesInDb = await Role.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(rolesInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Roles in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(rolesInDb).found();
});

exports.createRole = asyncRouteHandler(async (req, res) => {
  const validatedRole = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Role,
    validatedRole,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newRole = new Role(validatedRole);
  const createdRole = await newRole.save();
  return res.aydinnRes.send.data(createdRole.leanDoc).created();
});

exports.readRole = asyncRouteHandler(async (req, res) => {
  const roleId = requestUtils.getLastIdParamFromRequest(req);
  const roleInDb = await Role.findById(roleId);
  if (!roleInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(roleInDb.leanDoc).found();
});

exports.updateRole = asyncRouteHandler(async (req, res) => {
  const roleId = requestUtils.getLastIdParamFromRequest(req);
  const roleToBeUpdated = await Role.findById(roleId);
  if (!roleToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing role" })
      .notFound();
  }

  const validatedRole = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Role,
    validatedRole,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(roleToBeUpdated, validatedRole);
  const roleModified = roleToBeUpdated.isModified();
  const updatedRole = await roleToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedRole.leanDoc);
  if (roleModified) return respond.updated();
  return respond.notModified();
});

exports.deleteRole = asyncRouteHandler(async (req, res) => {
  const roleId = requestUtils.getLastIdParamFromRequest(req);
  const deletedRole = await Role.deleteOneByProperty("id", roleId);
  if (!deletedRole) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing role" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedRole.leanDoc).deleted();
});
