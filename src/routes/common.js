const verifyAdminRoles = require("../middlewares/verify-admin-roles");

exports.verifyAdminHasRolesByTitle = (requiredRoles = []) => {
  return verifyAdminRoles((authAdmin, roleInDb) => {
    return requiredRoles.includes(roleInDb.title) ? true : false;
  });
};
