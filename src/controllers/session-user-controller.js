const User = require("../../models/user-model");
const SessionUser = require("../../models/session-user-model");
const asyncRouteHandler = require("../../middlewares/error-handling/async-middleware-function");
const { AuthTokenCookie, tokenUtils } = require("../../helpers/auth");
const { getTimesAsMilliSeconds } = require("../../utils");

const refreshTokenCookie = new AuthTokenCookie("refreshToken");
refreshTokenCookie.overwriteOptions({
  secure: false,
  maxAge: getTimesAsMilliSeconds("1hr"),
});

exports.createUserSession = asyncRouteHandler(async (req, res) => {
  const uniqueCredentialName = "email";
  const InvalidCredentialsMsg = `${uniqueCredentialName} or password is incorrect`;
  const validatedCredentials = req.schemaValidation.success.value;
  const userInDb = await User.findOne({
    [uniqueCredentialName]: validatedCredentials[uniqueCredentialName],
  });

  const passwordMatches = await userInDb?.matchesPasswordInDb(
    validatedCredentials.password
  );

  if (!userInDb || !passwordMatches) {
    return res.aydinnRes.send
      .context({ message: InvalidCredentialsMsg })
      .unauthorized();
  }

  const user = userInDb._id;
  let sessionInDb = await SessionUser.findOne({ user });
  if (!sessionInDb) sessionInDb = new SessionUser({ user });
  const createdAccessToken = await userInDb.generateJwtAccessToken();
  const createdRefreshToken = await userInDb.generateJwtRefreshToken({
    expiresIn: refreshTokenCookie.options.maxAge,
  });

  sessionInDb.refreshToken = createdRefreshToken;
  await sessionInDb.save();
  refreshTokenCookie.set(res, createdRefreshToken);
  return res.aydinnRes.send.data({ accessToken: createdAccessToken }).created();
});

exports.updateUserSession = asyncRouteHandler(async (req, res) => {
  const { token } = tokenUtils.getTokenAttributes(
    req.cookies[refreshTokenCookie.name]
  );

  const decodedToken = await User.verifyJwtRefreshToken(token);
  const { user } = decodedToken.payload;
  const sessionInDb = await SessionUser.findOne({ user }).populate("user");
  if (!sessionInDb?.refreshToken) {
    return res.aydinnRes.send
      .context({ message: "User not currently authenticated" })
      .unauthorized();
  }

  if (sessionInDb.refreshToken !== token) {
    if (!sessionInDb.refreshTokenFamily.includes(token)) {
      return res.aydinnRes.send.unauthorized();
    }

    await sessionInDb.deleteJwtRefreshTokenAndFamily();
    await sessionInDb.save();
    const errMsg = "Hijacked session detected! Please, Re-authenticate";
    return res.aydinnRes.send.context({ message: errMsg }).unauthorized();
  }

  const userInSession = sessionInDb.user;
  const createdAccessToken = await userInSession.generateJwtAccessToken();
  const createdRefreshToken = await userInSession.generateJwtRefreshToken({
    expiresIn: refreshTokenCookie.options.maxAge,
  });

  sessionInDb.refreshToken = createdRefreshToken;
  await sessionInDb.save();
  refreshTokenCookie.set(res, createdRefreshToken);
  return res.aydinnRes.send.data({ accessToken: createdAccessToken }).created();
});

exports.deleteUserSession = asyncRouteHandler(async (req, res) => {
  const { token } = tokenUtils.getTokenFromAuthorizationHeader(
    req.headers?.authorization,
    "Bearer"
  );

  const decodedToken = await User.verifyJwtAccessToken(token);
  const { user } = decodedToken.payload;
  const sessionInDb = await SessionUser.findOne({ user });
  if (!sessionInDb?.refreshToken) {
    return res.aydinnRes.send
      .context({ message: "User not currently authenticated" })
      .unauthorized();
  }
  await sessionInDb.deleteJwtRefreshTokenAndFamily();
  await sessionInDb.save();
  refreshTokenCookie.clear(res);
  return res.aydinnRes.send
    .context({ message: "User un-authenticated" })
    .deleted();
});
