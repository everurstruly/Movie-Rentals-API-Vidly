const express = require("express");
const validator = require("../validators/role-validator");
const controller = require("../controllers/role-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const router = express.Router();

router.use(authorizeAdminAccess())

router.route("/")
  .get(controller.readRoles)
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.BOSS_FLOOR_a),
      validateRequestSchema(validator.isNewRole),
    ],
    controller.createRole
  );

router.route("/:id")
  .all(validateIdParamIsObjectId())
  .get(controller.readRole)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.BOSS_FLOOR_a),
      validateRequestSchema(validator.isWritableRole),
    ],
    controller.updateRole
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.BOSS_FLOOR_a), 
    ],
    controller.deleteRole
  );

module.exports = router;
