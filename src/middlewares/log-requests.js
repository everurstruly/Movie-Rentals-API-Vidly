const asyncMiddlewareFunc = require("../error-handling/async-middleware-function");
const config = require("../../config/default");
const logging = require("../../helpers/logging");
const utilFuncs = require("../../utils");

const hostToWatch = utilFuncs.getEnvValueAsArray(config.logger.hostsToWatch);
const requestsLogFile = logging.makeLogFileInfo("requests-log");

module.exports = asyncMiddlewareFunc(async (req, res, next) => {
  if (!hostToWatch.includes(req.headers.host)) return next();
  const { folderPath, filePath } = requestsLogFile;
  fs.exists(folderPath, (folderExists) => {
    if (folderExists) {
      logging.logRequest(req, filePath);
      return next();
    }

    fs.mkdir(folderPath, () => {
      logging.logRequest(req, filePath);
      return next();
    });
  });
});
