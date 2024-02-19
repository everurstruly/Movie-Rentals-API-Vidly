const Admin = require("../models/admin-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { utils: reqUtils } = require("../helpers/request");

const getUnavailaleDocValuesErrors = (doc, paths) => {
  return paths.map((path) => ({
    name: path,
    value: doc[path],
    reason: "already taken",
  }));
};

const getAdminIdFromRequest = (req) => {
  const normAdminId = reqUtils.getLastIdParamFromRequest(req);
  const authAdminId = reqUtils.getDecodedTokenFromRequest(req).payload.admin;
  const adminId = normAdminId || authAdminId;
  return adminId;
};

exports.readAdmins = asyncRouteHandler(async (_, res) => {
  const adminsInDb = await Admin.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(adminsInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Admins in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(adminsInDb).found();
});

exports.createAdmin = asyncRouteHandler(async (req, res) => {
  const validatedAdmin = req.schemaValidation.success.value;

  const { doc, paths } = await Admin.findDocWithUniquePaths(resource);
  if (doc) {
    const errors = getUnavailaleDocValuesErrors(resource, paths);
    return res.aydinnRes.errors(errors).alreadyExists();
  }
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Admin,
    validatedAdmin,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newAdmin = new Admin(validatedAdmin);
  const createdAdmin = await newAdmin.save();
  return res.aydinnRes.send.data(createdAdmin.leanDoc).created();
  return res.aydinnRes.created.data(createdAdmin.leanDoc).send();
});

exports.readAdmin = asyncRouteHandler(async (req, res) => {
  const adminId = getAdminIdFromRequest(req);
  const adminInDb = await Admin.findById(adminId);
  if (!adminInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(adminInDb.leanDoc).found();
});

exports.updateAdmin = asyncRouteHandler(async (req, res) => {
  const adminId = getAdminIdFromRequest(req);
  const adminToBeUpdated = await Admin.findById(adminId);
  if (!adminToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: `Cannot update a non-existing admin` })
      .notFound();

    return res.aydinnRes.notFound
      .context({ message: `Cannot update a non-existing admin` })
      .send();
  }

  const validatedAdmin = req.schemaValidation.success.value;

  const { doc, paths } = await Admin.findDocWithUniquePaths(resource);
  if (doc) {
    const errors = getUnavailaleDocValuesErrors(resource, paths);
    return res.aydinnRes.errors(errors).alreadyExists();
  }
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Admin,
    validatedAdmin,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(adminToBeUpdated, validatedAdmin);
  const adminModified = adminToBeUpdated.isModified();
  const updatedAdmin = await adminToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedAdmin.leanDoc);
  if (adminModified) return respond.updated();
  return respond.notModified();
});

exports.deleteAdmin = asyncRouteHandler(async (req, res) => {
  const adminId = getAdminIdFromRequest(req);
  const deletedAdmin = await Admin.deleteOneByProperty("id", adminId);
  if (!deletedAdmin) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing admin" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedAdmin.leanDoc).deleted();
});
