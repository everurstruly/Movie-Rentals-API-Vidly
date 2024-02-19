const validator = require("../validators/requerst-query-validator");

module.exports = {
  validateDataProcessingQuery: (reqPropertyKey = "dataProcessingQuery") => {
    return (req, res, next) => {
      const query = req[reqPropertyKey];
      const { failure, success } = validator.isDataProcessingQuery(query);
      if (success) return next();
      const respondWith = res.aydinnRes.send;
      failure.errors.forEach((error) => respondWith.error({ ...error }));
      return respondWith
        .context({ message: "Invalid query string format" })
        .badRequest();
    };
  },
};
