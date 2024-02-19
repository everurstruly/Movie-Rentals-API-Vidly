const User = require("../models/user-model");
const SessionUser = require("../models/session-user-model");
const asyncMiddlewareFunc = require("./common/async-middleware-function");
const { authUtils, tokenErrors } = require("../lib/auth");
const hpFuncs = require("../lib/helper-functions");

const defaultOptions = {
  autoRespondIfBanned: true,
  message: "User is Banned!",
};

module.exports = (middlewareOptions = {}) =>
  asyncMiddlewareFunc(async (req, res, next) => {
    const { autoRespondIfBanned, message } = {
      ...defaultOptions,
      ...middlewareOptions,
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

    // token-error-info if error-handling deligated to route-error-handler
    req.tokenError = { name: tokenName, token };
    const decodedToken = await User.verifyJwtAccessToken(token);
    const { user } = decodedToken.payload;
    const userInSession = await SessionUser.findOne({ user });
    if (!userInSession?.refreshToken) {
      throw tokenErrors.TokenExpiredSessionError();
    }

    if (autoRespondIfBanned && decodedToken.payload.isBanned) {
      return res.aydinnRes.send.context({ message }).forbidden();
    }

    req.tokenName = tokenName;
    req.decodedTokenName = decodedTokenName;
    req[tokenName] = token;
    req[decodedTokenName] = decodedToken;
    return next();
  });
