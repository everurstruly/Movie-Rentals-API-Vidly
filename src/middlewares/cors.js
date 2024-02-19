const cors = require("cors");
const config = require("../helpers/config");
const utils = require("../utils");

class CORSError extends Error {
  constructor(message) {
    super(message);
    this.name = "CORSError";
  }
}

const allowedOrigins = utils.getEnvValueAsArray(
  config.get("cors.allowedOrigins")
);

const shouldAllowDevToolsOrigin = utils.getEnvValueAsBoolean(
  config.get("cors.allowApiDevToolsOrigin")
);

module.exports = () => {
  return cors({
    credentials: true,
    optionsSuccessStatus: 200,
    origin: (reqOrigin, callback) => {
      if (
        (!reqOrigin && shouldAllowDevToolsOrigin) ||
        allowedOrigins.includes(reqOrigin)
      ) {
        return callback(null, true);
      }

      return callback(new CORSError("Cross-Origin Request blocked"), false);
    },
  });
};
