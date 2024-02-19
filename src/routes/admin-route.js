const express = require("express");
const adminValidator = require("../validators/admin-validator");
const adminController = require("../controllers/admin-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const verifyAdminModifiable = require("../middlewares/verify-admin-modifiable");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const adminRouter = express.Router();

adminRouter.use(authorizeAdminAccess());

adminRouter.route("/")
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(adminValidator.isNewAdmin),
      verifyAdminModifiable(),
    ],
    adminController.createAdmin
  )
  .get(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a),
    ],
    adminController.readAdmins
  );

adminRouter.route("/me")
  .get(adminController.readAdmin)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.BOSS_FLOOR_a),
      validateRequestSchema(adminValidator.isWritableSelfAdmin),
      verifyAdminModifiable(),
    ],
    adminController.updateAdmin
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.BOSS_FLOOR_a),
      verifyAdminModifiable(),
    ],
    adminController.deleteAdmin
  );

adminRouter.route("/:id")
  .all(validateIdParamIsObjectId())
  .get(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a),
    ],
    adminController.readAdmin
  )
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      validateRequestSchema(adminValidator.isWritableAdmin),
      verifyAdminModifiable(),
    ],
    adminController.updateAdmin
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1),
      verifyAdminModifiable(),
    ],
    adminController.deleteAdmin
  );


module.exports = adminRouter;
