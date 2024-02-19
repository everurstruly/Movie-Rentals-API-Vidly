const config = require("../helpers/config");
const responseFormatter = require("../lib/express-response-formatter");
const requestLogger = require("../middlewares/logging/request-logger");
const errorLogger = require("../middlewares/logging/error-logger");
const routeErrorHandler = require("../middlewares/request-error-handler");
const queryFormatter = require("../middlewares/request-query-formatter");
const bodyParser = require("../middlewares/request-body-parser");
const cookieParser = require("cookie-parser");
const cors = require("../middlewares/cors");
const requestNotImplemented = require("../middlewares/error-handling/request-not-implemented");

const { getAsApiRoute } = config.do;

module.exports = async (app) => {
  app.use(requestLogger);
  app.use(responseFormatter());
  app.use(queryFormatter());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(cors());

  app.use(require("../routes/root-route"));
  app.use("*/health-check", require("../routes/server-health-check"));
  app.use(getAsApiRoute("/auth/session"), require("../routes/session-route"));
  app.use(getAsApiRoute("/memberships"), require("../routes/membership-route"));
  app.use(getAsApiRoute("/rentals"), require("../routes/rental-route"));
  app.use(getAsApiRoute("/genres"), require("../routes/genre-route"));
  app.use(getAsApiRoute("/roles"), require("../routes/role-route"));
  app.use(getAsApiRoute("/movies"), require("../routes/movie-route"));
  app.use(getAsApiRoute("/users"), require("../routes/user-route"));
  app.use(getAsApiRoute("/admins"), require("../routes/admin-route"));
  app.use(requestNotImplemented);

  app.use(routeErrorHandler({ fowardError: true }));
  app.use(errorLogger);
  return app;
};
