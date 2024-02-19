const Admin = require("../models/admin-model");
const SessionAdmin = require("../models/session-admin-model");
const asyncRouteHandler = require("../../middlewares/error-handling/async-middleware-function");
const { AuthTokenCookie, tokenUtils } = require("../helpers/auth");
const { getTimesAsMilliSeconds } = require("../../utils");

const refreshTokenCookie = new AuthTokenCookie("refreshToken");
refreshTokenCookie.overwriteOptions({
  secure: false,
  maxAge: getTimesAsMilliSeconds("2hr"),
});

exports.createAdminSession = asyncRouteHandler(async (req, res) => {
  const uniqueCredentialName = "email";
  const InvalidCredentialsMsg = `${uniqueCredentialName} or password is incorrect`;
  const validatedCredentials = req.schemaValidation.success.value;
  const adminInDb = await Admin.findOne({
    [uniqueCredentialName]: validatedCredentials[uniqueCredentialName],
  });

  const passwordMatches = await adminInDb?.matchesPasswordInDb(
    validatedCredentials.password
  );

  if (!adminInDb || !passwordMatches) {
    return res.aydinnRes.send
      .context({ message: InvalidCredentialsMsg })
      .unauthorized();
  }

  const admin = adminInDb._id;
  let sessionInDb = await SessionAdmin.findOne({ admin });
  if (!sessionInDb) sessionInDb = new SessionAdmin({ admin });
  const createdAccessToken = await adminInDb.generateJwtAccessToken({
    expiresIn: refreshTokenCookie.options.maxAge,
  });

  const createdRefreshToken = await adminInDb.generateJwtRefreshToken({
    expiresIn: refreshTokenCookie.options.maxAge,
  });

  sessionInDb.refreshToken = createdRefreshToken;
  await sessionInDb.save();
  refreshTokenCookie.set(res, createdRefreshToken);
  return res.aydinnRes.send.data({ accessToken: createdAccessToken }).created();
});

exports.updateAdminSession = asyncRouteHandler(async (req, res) => {
  const { token } = tokenUtils.getTokenAttributes(
    req.cookies[refreshTokenCookie.name]
  );

  const decodedToken = await Admin.verifyJwtRefreshToken(token);
  const { admin } = decodedToken.payload;
  const sessionInDb = await SessionAdmin.findOne({ admin }).populate("admin");
  if (!sessionInDb?.refreshToken) {
    return res.aydinnRes.send
      .context({ message: "Admin not currently authenticated" })
      .unauthorized();
  }

  if (sessionInDb.refreshToken !== token) {
    if (!sessionInDb.refreshTokenFamily.includes(token)) {
      return res.aydinnRes.send.unauthorized();
    }

    await sessionInDb.deleteJwtRefreshTokenAndFamily();
    await sessionInDb.save();
    const errorMsg = "Hijacked session detected! Please, Re-authenticate";
    return res.aydinnRes.send.context({ message: errorMsg }).unauthorized();
  }

  const adminInSession = sessionInDb.admin;
  const createdAccessToken = await adminInSession.generateJwtAccessToken();
  const createdRefreshToken = await adminInSession.generateJwtRefreshToken({
    expiresIn: refreshTokenCookie.options.maxAge,
  });

  sessionInDb.refreshToken = createdRefreshToken;
  await sessionInDb.save();
  refreshTokenCookie.set(res, createdRefreshToken);
  return res.aydinnRes.send.data({ accessToken: createdAccessToken }).created();
});

exports.deleteAdminSession = asyncRouteHandler(async (req, res) => {
  const { token } = tokenUtils.getTokenFromAuthorizationHeader(
    req.headers?.authorization,
    "Bearer"
  );

  const decodedToken = await Admin.verifyJwtAccessToken(token);
  const { admin } = decodedToken.payload;
  const sessionInDb = await SessionAdmin.findOne({ admin });
  if (!sessionInDb?.refreshToken) {
    return res.aydinnRes.send
      .context({ message: "Admin not currently authenticated" })
      .unauthorized();
  }

  await sessionInDb.deleteJwtRefreshTokenAndFamily();
  await sessionInDb.save();
  refreshTokenCookie.clear(res);
  return res.aydinnRes.send
    .context({ message: "Admin un-authenticated" })
    .deleted();
});
