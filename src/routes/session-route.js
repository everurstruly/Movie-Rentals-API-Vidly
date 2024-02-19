const express = require("express");
const validator = require("../validators/auth-validator");
const sessionUserController = require("../controllers/auth/session-user-controller");
const sessionAdminController = require("../controllers/auth/session-admin-controller");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");

const router = express.Router();

router.route("/users")
  .post(
    [
      validateRequestSchema(validator.isUserAuthCredentials),
    ],
    sessionUserController.createUserSession
  )
  .get(sessionUserController.updateUserSession)
  .delete(sessionUserController.deleteUserSession);

router.route("/admins")
  .post(
    [
      validateRequestSchema(validator.isAdminAuthCredentials),
    ],
    sessionAdminController.createAdminSession
  )
  .get(sessionAdminController.updateAdminSession)
  .delete(sessionAdminController.deleteAdminSession);

module.exports = router;
