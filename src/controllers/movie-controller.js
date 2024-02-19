const Movie = require("../models/movie-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const { requestUtils } = require("../lib/express-http-helpers");
const { searchDuplicateAndIssueReponse } = require("./common.js");

exports.readMovies = asyncRouteHandler(async (_, res) => {
  const moviesInDb = await Movie.findAndSelectLeanDoc();
  if (hpFuncs.isEmptyArray(moviesInDb)) {
    return res.aydinnRes.send
      .context({ message: "There are no Movies in the database" })
      .notFound();
  }

  return res.aydinnRes.send.data(moviesInDb).found();
});

exports.readMoviesCharges = asyncRouteHandler(async (req, res) => {
  const { moviesIds } = req.schemaValidation.success.value;
  const moviesCharges = await moviesIds.reduce(async (accum, movieId) => {
    const awaitedAccum = await accum;
    const movieInDb = await Movie.findById(movieId);
    awaitedAccum[movieId] = movieInDb?.movieCharges || null;
    return awaitedAccum;
  }, {});

  return res.aydinnRes.send.data(moviesCharges).found();
});

exports.createMovie = asyncRouteHandler(async (req, res) => {
  const validatedMovie = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Movie,
    validatedMovie,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newMovie = new Movie(validatedMovie);
  const createdMovie = await newMovie.save();
  return res.aydinnRes.send.data(createdMovie.leanDoc).created();
});

exports.readMovie = asyncRouteHandler(async (req, res) => {
  const movieId = requestUtils.getLastIdParamFromRequest(req);
  const movieInDb = await Movie.findById(movieId);
  if (!movieInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(movieInDb.leanDoc).found();
});

exports.updateMovie = asyncRouteHandler(async (req, res) => {
  const movieId = requestUtils.getLastIdParamFromRequest(req);
  const movieToBeUpdated = await Movie.findById(movieId);
  if (!movieToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: "Cannot update a non-existing movie" })
      .notFound();
  }

  const validatedMovie = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    Movie,
    validatedMovie,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(movieToBeUpdated, validatedMovie);
  const movieModified = movieToBeUpdated.isModified();
  const updatedMovie = await movieToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedMovie.leanDoc);
  if (movieModified) return respond.updated();
  return respond.notModified();
});

exports.deleteMovie = asyncRouteHandler(async (req, res) => {
  const movieId = requestUtils.getLastIdParamFromRequest(req);
  const deletedMovie = await Movie.deleteOneByProperty("id", movieId);
  if (!deletedMovie) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing movie" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedMovie.leanDoc).deleted();
});
