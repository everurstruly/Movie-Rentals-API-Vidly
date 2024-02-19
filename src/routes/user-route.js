const express = require("express");
const validator = require("../validators/user-validator");
const controller = require("../controllers/user-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const authorizeUserAccess = require("../middlewares/authorize-user-access");
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const router = express.Router();

router.route("/")
  .all(authorizeAdminAccess())
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(validator.isNewUser),
    ],
    controller.createUser
  )
  .get(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a), 
    ],
    controller.readUsers
  );

router.route("/me")
  .all(authorizeUserAccess())
  .get(controller.readUser);

router.route("/:id")
  .all(validateIdParamIsObjectId(), authorizeAdminAccess())
  .get(controller.readUser)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(validator.isWritableUser),
    ],
    controller.updateUser
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
    ],
    controller.deleteUser
  );

module.exports = router;
