const config = require("../../config/default");
const logging = require("../../helpers/logging");
const utilFuncs = require("../../utils");

const errorsToIgnore = utilFuncs.getEnvValueAsArray(config.logger.errorsToIgnore);
const errorsLogFile = logging.makeLogFileInfo("uncaught-errors-log");
const defaultOptions = { forwardError: false };

module.exports = (options = {}) => {
  return async (error, req, res, next) => {
    try {
      if (errorsToIgnore.includes(error.name)) return next();
      const { folderPath, filePath } = errorsLogFile;
      const { forwardError } = {
        ...defaultOptions,
        ...options,
      };

      fs.exists(folderPath, (folderExists) => {
        if (folderExists) {
          logging.logError(error, filePath);
          if (forwardError) return next(error);
        }

        fs.mkdir(folderPath, () => {
          logging.logError(error, filePath);
          if (forwardError) return next(error);
        });
      });
    } catch (error) {
      logging.logError(error, filePath);
    }
  };
};
