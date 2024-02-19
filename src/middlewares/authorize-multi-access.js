const asyncMiddlewareFunc = require("./common/async-middleware-function");

module.exports = (...authorizers) => {
  return asyncMiddlewareFunc(async (req, res, next) => {
    const errors = [];
    let hasSuccessfullyAuthorized = false;

    const onAuthorizerNext = (error) => {
      if (error) errors.push(error);
      else hasSuccessfullyAuthorized = true;
    };

    for (let authorizer of authorizers) {
      const hasResponded = await authorizer(req, res, onAuthorizerNext);
      if (hasResponded) return;
      if (hasSuccessfullyAuthorized) return next();
    }

    for (let error of errors) next(error);
  });
};
