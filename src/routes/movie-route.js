const express = require("express");
const validator = require("../validators/movie-validator");
const controller = require("../controllers/movie-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const authorizeMultiAccess = require('../middlewares/authorize-multi-access');
const authorizeUserAccess = require("../middlewares/authorize-user-access");
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const router = express.Router();

router.route("*")
  .post(authorizeAdminAccess())
  .get(
    authorizeMultiAccess(
      authorizeAdminAccess(), 
      authorizeUserAccess()
    )
  )
  .patch(authorizeAdminAccess())
  .delete(authorizeAdminAccess());

router.route("/")
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(validator.isNewMovie),
    ],
    controller.createMovie
  )
  .get(controller.readMovies);

router.route("/:id")
  .all(validateIdParamIsObjectId())
  .get(controller.readMovie)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(validator.isWritableMovie),
    ],
    controller.updateMovie
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
    ],
    controller.deleteMovie
  );

module.exports = router;
