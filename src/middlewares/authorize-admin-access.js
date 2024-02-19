const Admin = require("../models/admin-model");
const SessionAdmin = require("../models/session-admin-model");
const asyncMiddlewareFunc = require("./common/async-middleware-function");
const { authUtils, tokenErrors } = require("../lib/auth");
const hpFuncs = require("../lib/helper-functions");

const defaultOptions = {
  autoRespondIfSuspended: true,
  message: "Admin is Suspended!",
};

module.exports = (options = {}) => {
  return asyncMiddlewareFunc(async (req, res, next) => {
    const { autoRespondIfSuspended, message } = {
      ...defaultOptions,
      ...options,
    };

    const tokenName = "accessToken";
    const decodedTokenName = `decoded${hpFuncs.textToPascalCase(tokenName)}`;
    const reqAuthHeader = req.headers.authorization;
    const reqToken =
      authUtils.getTokenFromAuthorizationHeader(reqAuthHeader, "Bearer")
        .value || req.cookies[tokenName];

    const { token } = authUtils.getTokenAttributes(reqToken);
    if (!token) {
      return res.aydinnRes.send
        .context({ message: `${tokenName} not provided` })
        .badRequest();
    }

    // token-error-info if error-response-handling deligated to route-error-handler
    req.tokenError = { name: tokenName, token };

    const decodedToken = await Admin.verifyJwtAccessToken(token);
    const { admin } = decodedToken.payload;
    const adminInSession = await SessionAdmin.findOne({ admin });
    if (!adminInSession?.refreshToken) {
      throw tokenErrors.TokenExpiredSessionError();
    }

    if (autoRespondIfSuspended && decodedToken.payload.isSuspended) {
      return res.aydinnRes.send.context({ message }).forbidden();
    }

    req.tokenName = tokenName;
    req.decodedTokenName = decodedTokenName;
    req[tokenName] = token;
    req[decodedTokenName] = decodedToken;
    return next();
  });
};
