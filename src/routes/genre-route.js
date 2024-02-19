const express = require("express");
const validator = require("../validators/genre-validator");
const controller = require("../controllers/genre-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const authorizeUserAccess = require("../middlewares/authorize-user-access");
const authorizeMultiAccess = require("../middlewares/authorize-multi-access")
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const router = express.Router();

router.route("/")
  .get(
  [
    authorizeMultiAccess(authorizeAdminAccess(), authorizeUserAccess())
  ],
  controller.readGenres
  )
  .post(
    [
      authorizeAdminAccess(),
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
      validateRequestSchema(validator.isNewGenre),
    ],
    controller.createGenre
  );

router.route("/:id")
  .all(validateIdParamIsObjectId())
  .get(
    [
      authorizeMultiAccess(authorizeAdminAccess(), authorizeUserAccess())
    ],
    controller.readGenre
  )
  .patch(
    [
      authorizeAdminAccess(),
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
      validateRequestSchema(validator.isWritableGenre),
    ],
    controller.updateGenre
  )
  .delete(
    [
      authorizeAdminAccess(),
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
    ],
    controller.deleteGenre
  );

module.exports = router;
