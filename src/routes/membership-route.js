const express = require("express");
const validator = require("../validators/membership-validator");
const controller = require("../controllers/membership-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const authorizeUserAccess = require("../middlewares/authorize-user-access");
const authorizeMultiAccess = require("../middlewares/authorize-multi-access");
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
  .get(controller.readMemberships)
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
      validateRequestSchema(validator.isNewMembership),
    ],
    controller.createMembership
  );

router.route("/:id")
  .all(validateIdParamIsObjectId())
  .get(controller.readMembership)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
      validateRequestSchema(validator.isWritableMembership),
    ],
    controller.updateMembership
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1), 
    ],
    controller.deleteMembership
  );

module.exports = router;
