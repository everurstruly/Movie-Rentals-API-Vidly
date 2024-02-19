const Admin = require("../models/admin-model");
const Role = require("../models/role-model");
const asyncMiddlewareFunction = require("./common/async-middleware-function");
const { requestUtils: reqUtils } = require("../lib/express-http-helpers");
const controllerConstants = require("../controllers/constants");

const { ADMIN_MIN_ROLE_LEVEL_TO_MODIFY_SELF } = controllerConstants;

const getMaxAssignedRolesLevel = async (adminDoc) => {
  const adminNotFoundRoleLevel = -1;
  const roleProperyKey = "assignedRoleIds";
  if (!adminDoc || !adminDoc[roleProperyKey]) return adminNotFoundRoleLevel;
  const maxLevel = await adminDoc?.[roleProperyKey]?.reduce(
    async (maxLevel, assignedRoleId) => {
      const awaitedMaxLevel = await maxLevel;
      const roleInDb = await Role.findById(assignedRoleId);
      if (!roleInDb) return adminNotFoundRoleLevel;
      return Math.max(awaitedMaxLevel, roleInDb.level);
    },
    0
  );

  return maxLevel;
};

const getAuthorizedAdminId = (req) => {
  return reqUtils.getDecodedTokenFromRequest(req).payload.admin;
};

module.exports = () => {
  return asyncMiddlewareFunction(async (req, res, next) => {
    const authAdminId = getAuthorizedAdminId(req);
    const normAdminId = reqUtils.getLastIdParamFromRequest(req);

    // admin trying to modify his/her (self), indirectly
    if (authAdminId === normAdminId) {
      return res.aydinnRes.send.forbidden();
    }

    const authAdminInDb = await Admin.findById(authAdminId);
    const normAdminInDb = await Admin.findById(normAdminId);
    const adminDto = req.schemaValidation?.success?.value;

    const maxNormAdminRoleLevel = await getMaxAssignedRolesLevel(normAdminInDb);
    const maxAuthAdminRoleLevel = await getMaxAssignedRolesLevel(authAdminInDb);
    const maxAdminToBeRoleLevel = await getMaxAssignedRolesLevel(adminDto);

    // admin trying to modify other admin in the database
    if (authAdminInDb && normAdminInDb) {
      if (maxNormAdminRoleLevel >= maxAuthAdminRoleLevel) {
        return res.aydinnRes.send.forbidden();
      }
    }

    // admin trying to modify other admin not in the database
    if (authAdminInDb && adminDto) {
      if (maxAdminToBeRoleLevel > maxAuthAdminRoleLevel) {
        return res.aydinnRes.send.forbidden();
      }
    }

    // admin trying to modify his/her (self)
    if (authAdminInDb && !normAdminId) {
      if (ADMIN_MIN_ROLE_LEVEL_TO_MODIFY_SELF > maxAuthAdminRoleLevel) {
        return res.aydinnRes.send.forbidden();
      }
    }

    return next();
  });
};
