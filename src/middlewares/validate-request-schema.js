const asyncMiddlewareFunc = require("./async-middleware-function");

module.exports = (schemaValidator, requestProperty = "body", autoRespond) => {
  return asyncMiddlewareFunc(async (req, res, next) => {
    const validation = schemaValidator(req[requestProperty]);
    req.schemaValidation = validation;
    if (validation.success || !autoRespond) return next();
    const respondWith = res.aydinnRes.send;
    validation.failure.errors.forEach((error) => {
      return respondWith.error({ ...error });
    });

    return respondWith.badRequest();
  });
};
