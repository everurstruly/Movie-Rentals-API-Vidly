const Membership = require("../models/membership-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { requestUtils } = require("../lib/express-http-helpers");
const { searchDuplicateAndIssueReponse } = require("./common.js");

exports.readMemberships = asyncRouteHandler(async (_, res) => {
  const membershipsInDb = await Membership.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(membershipsInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Memberships in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(membershipsInDb).found();
});

exports.createMembership = asyncRouteHandler(async (req, res) => {
  const validatedMembership = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Membership,
    validatedMembership,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newMembership = new Membership(validatedMembership);
  const createdMembership = await newMembership.save();
  return res.aydinnRes.send.data(createdMembership.leanDoc).created();
});

exports.readMembership = asyncRouteHandler(async (req, res) => {
  const membershipId = requestUtils.getLastIdParamFromRequest(req);
  const membershipInDb = await Membership.findById(membershipId);
  if (!membershipInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(membershipInDb.leanDoc).found();
});

exports.updateMembership = asyncRouteHandler(async (req, res) => {
  const membershipId = requestUtils.getLastIdParamFromRequest(req);
  const membershipToBeUpdated = await Membership.findById(membershipId);
  if (!membershipToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing membership" })
      .notFound();
  }

  const validatedMembership = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Membership,
    validatedMembership,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(
    membershipToBeUpdated,
    validatedMembership
  );

  const membershipModified = membershipToBeUpdated.isModified();
  const updatedMembership = await membershipToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedMembership.leanDoc);
  if (membershipModified) return respond.updated();
  return respond.notModified();
});

exports.deleteMembership = asyncRouteHandler(async (req, res) => {
  const membershipId = requestUtils.getLastIdParamFromRequest(req);
  const deletedMembership = await Membership.deleteOneByProperty(
    "id",
    membershipId
  );

  if (!deletedMembership) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing membership" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedMembership.leanDoc).deleted();
});
