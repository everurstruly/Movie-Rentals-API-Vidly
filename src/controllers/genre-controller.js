const Genre = require("../models/genre-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { requestUtils } = require("../lib/express-http-helpers");
const { searchDuplicateAndIssueReponse } = require("./common.js");

exports.readGenres = asyncRouteHandler(async (_, res) => {
  const genresInDb = await Genre.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(genresInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Genres in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(genresInDb).found();
});

exports.createGenre = asyncRouteHandler(async (req, res) => {
  const validatedGenre = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Genre,
    validatedGenre,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newGenre = new Genre(validatedGenre);
  const createdGenre = await newGenre.save();
  return res.aydinnRes.send.data(createdGenre.leanDoc).created();
});

exports.readGenre = asyncRouteHandler(async (req, res) => {
  const genreId = requestUtils.getLastIdParamFromRequest(req);
  const genreInDb = await Genre.findById(genreId);
  if (!genreInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(genreInDb.leanDoc).found();
});

exports.updateGenre = asyncRouteHandler(async (req, res) => {
  const genreId = requestUtils.getLastIdParamFromRequest(req);
  const genreToBeUpdated = await Genre.findById(genreId);
  if (!genreToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing genre" })
      .notFound();
  }

  const validatedGenre = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Genre,
    validatedGenre,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(genreToBeUpdated, validatedGenre);
  const genreModified = genreToBeUpdated.isModified();
  const updatedGenre = await genreToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedGenre.leanDoc);
  if (genreModified) return respond.updated();
  return respond.notModified();
});

exports.deleteGenre = asyncRouteHandler(async (req, res) => {
  const genreId = requestUtils.getLastIdParamFromRequest(req);
  const deletedGenre = await Genre.deleteOneByProperty("id", genreId);
  if (!deletedGenre) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing genre" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedGenre.leanDoc).deleted();
});
