const express = require("express");
const movieController = require("../controllers/movie-controller");
const controller = require("../controllers/rental-controller");
const validator = require("../validators/rental-validator");
const validateRequestSchema = require("../middlewares/common/validate-request-schema");
const validateIdParamIsObjectId = require("../middlewares/common/validate-id-param-is-object-id");
const authorizeAdminAccess = require("../middlewares/authorize-admin-access");
const { verifyAdminHasRolesByTitle } = require("./common");
const constants = require("../lib/constants");

const authorizedRoles = constants.AUTHORIZED_ADMIN_ROLES_BY_TITLE;
const router = express.Router();

router.use(authorizeAdminAccess());

router
  .route("/")
  .post(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.ROOKIE_FLOOR_a1),
      validateRequestSchema(validator.isNewRental),
    ],
    controller.createRental
  )
  .get(controller.readRentals);

router
  .route("/:id")
  .all(validateIdParamIsObjectId())
  .get(controller.readRental)
  .patch(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.ROOKIE_FLOOR_a1),
      validateRequestSchema(validator.isWritableRental),
    ],
    controller.updateRental
  )
  .delete(
    [
      verifyAdminHasRolesByTitle(authorizedRoles.MANAGEMENT_FLOOR_a1)
    ],
    controller.deleteRental
  );

router
  .route("/returns/:id")
  .all(validateIdParamIsObjectId())
  .put(controller.putRentalReturn);

router.get(
  "/charges/movies",
  [
    validateRequestSchema((reqBody) => {
      return validator.isRentalPropertyAsObject("moviesIds", reqBody);
    }),
  ],
  movieController.readMoviesCharges
);

module.exports = router;
