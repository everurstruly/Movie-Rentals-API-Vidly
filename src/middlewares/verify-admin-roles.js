const Admin = require("../models/admin-model");
const Role = require("../models/role-model");
const asyncMiddlewareFunction = require("./common/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");

const getAuthorizedAdminId = (req) => {
  return req[req.decodedTokenName].payload.admin;
};

module.exports = (shouldMakeRoleInDbRequired) => {
  return asyncMiddlewareFunction(async (req, res, next) => {
    const authAdminId = getAuthorizedAdminId(req);
    const authAdminInDb = await Admin.findById(authAdminId);
    if (!authAdminInDb) return res.aydinnRes.send.unauthorized();

    const rolesInDb = await Role.find();
    const requiredRoles = rolesInDb.reduce((requiredRoles, roleInDb) => {
      if (shouldMakeRoleInDbRequired(authAdminInDb, roleInDb)) {
        requiredRoles.push(roleInDb);
      }

      return requiredRoles;
    }, []);

    if (hpFuncs.isEmptyArray(requiredRoles)) {
      throw new Error(`There are no 'requiredRoles' in the database`);
    }

    let hasRequiredRole = false;
    const rolesNotAssigned = requiredRoles.reduce((roles, requiredRole) => {
      const assignedRoleKey = "id";
      const { assignedRoles } = authAdminInDb;
      const requiredRoleValue = requiredRole[assignedRoleKey];
      if (assignedRoles.includes(requiredRoleValue)) {
        hasRequiredRole = true;
      } else {
        roles.push(requiredRole[assignedRoleKey]);
      }

      return roles;
    }, []);

    if (hasRequiredRole) return next();
    const roleWordGrammar = rolesNotAssigned.length > 1 ? "roles" : "role";
    const message = `Required ${roleWordGrammar} not asssigned`;
    return res.aydinnRes.send
      .context({ message })
      .error({
        name: "assignedRoles",
        value: rolesNotAssigned,
        reason: "missing",
      })
      .forbidden();
  });
};
