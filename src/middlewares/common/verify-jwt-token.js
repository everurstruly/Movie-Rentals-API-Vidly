const jwt = require("jsonwebtoken");
const asyncMiddlwareFunc = require("./async-middleware-function");
const { authUtils } = require("../../helpers/auth");
const hpFuncs = require("../../helpers/helper-functions");

const defaultOptions = {
  tokenAccessor: "token",
  requestHeader: "authorization",
  secret: "secret",
  // validator(any): { error?: any, ...any };
  validator: (tokenPayload) => ({ error: true }),
};

module.exports = (options = {}) => {
  return asyncMiddlwareFunc(async (req, res, next) => {
    const { tokenAccessor, requestHeader, secret, validator } = {
      ...defaultOptions,
      ...options,
    };

    const decodedTokenAccessor = `decoded${hpFuncs.textToPascalCase(
      tokenAccessor
    )}`;

    const reqHeaderToken = req.headers[requestHeader];
    const { token } = authUtils.getTokenFromAuthorizationHeader(
      reqHeaderToken,
      "Bearer"
    );

    if (!token) {
      return res.aydinnRes.send
        .context({ message: `token not provided` })
        .badRequest();
    }

    const decodedToken = jwt.verify(token, secret);
    const payloadValidation = validator(payload);
    if (payloadValidation.error) {
      const newErr = new Error("token payload failed validation");
      newErr.name = "TokenPayloadMalformed";
      throw newErr;
    }

    req[tokenAccessor] = token;
    req[decodedTokenAccessor] = decodedToken;
    req.tokenAccessor = tokenAccessor;
    req.decodedTokenAccessor = decodedTokenAccessor;
    return next();
  });
};
