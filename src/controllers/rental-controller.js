const Rental = require("../models/rental-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { requestUtils } = require("../lib/express-http-helpers");
const { searchDuplicateAndIssueReponse } = require("./common.js");

rentalSchema.static("assembleRentalFromTokenAndDTO", async function (data) {
  const { user, movies } = data.formDto;
  const { admin: byAdmin } = data.tokenPayload;
  const at = new Date().toISOString();
  return {
    user: user,
    movies: movies,
    out: { byAdmin, at },
    return: { byAdmin: null, at: null },
    lastModified: { byAdmin, at },
  };
});

exports.readRentals = asyncRouteHandler(async (_, res) => {
  const rentalsInDb = await Rental.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(rentalsInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Rentals in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(rentalsInDb).found();
});

exports.createRental = asyncRouteHandler(async (req, res) => {
  const validatedRental = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Rental,
    validatedRental,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const tokenPayload = req[req.decodedTokenName].payload;
  const rentalDto = await Rental.assembleRentalFromTokenAndDTO({
    tokenPayload,
    formDto: validatedRental,
  });

  const newRental = new Rental(rentalDto);
  const createdRental = await newRental.save();
  return res.aydinnRes.send.data(createdRental.leanDoc).created();
});

exports.readRental = asyncRouteHandler(async (req, res) => {
  const rentalId = requestUtils.getLastIdParamFromRequest(req);
  const rentalInDb = await Rental.findById(rentalId);
  if (!rentalInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(rentalInDb.leanDoc).found();
});

exports.updateRental = asyncRouteHandler(async (req, res) => {
  const rentalId = requestUtils.getLastIdParamFromRequest(req);
  const rentalToBeUpdated = await Rental.findById(rentalId);
  if (!rentalToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing rental" })
      .notFound();
  }

  const validatedRental = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Rental,
    validatedRental,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(rentalToBeUpdated, validatedRental);
  const rentalModified = rentalToBeUpdated.isModified();
  const updatedRental = await rentalToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedRental.leanDoc);
  if (rentalModified) return respond.updated();
  return respond.notModified();
});

exports.deleteRental = asyncRouteHandler(async (req, res) => {
  const rentalId = requestUtils.getLastIdParamFromRequest(req);
  const deletedRental = await Rental.deleteOneByProperty("id", rentalId);
  if (!deletedRental) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing rental" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedRental.leanDoc).deleted();
});

exports.putRentalReturn = asyncRouteHandler(async (req, res) => {
  const authAdminId = requestUtils.getAuthAdminIdFromRequest(req);
  const rentalId = requestUtils.getLastIdParamFromRequest(req);
  const rentalToReturned = await Rental.findById(rentalId);
  if (!rentalToReturned) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing rental" })
      .notFound();
  }

  if (rentalToReturned.return.byAdminId) {
    return res.aydinnRes.send
      .context({ message: "Rental has already been processed" })
      .forbidden();
  }

  rentalToReturned.return.byAdminId = authAdminId;
  rentalToReturned.return.at = new Date().toISOString();
  const updatedRental = await rentalToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedRental.leanDoc);
  if (!updatedRental.isModified()) return respond.notModified();
  return respond.updated();
});
