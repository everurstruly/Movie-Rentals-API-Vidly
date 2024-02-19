const User = require("../models/user-model");
const asyncRouteHandler = require("../middlewares/error-handling/async-middleware-function");
const hpFuncs = require("../lib/helper-functions");
const common = require("./common.js");

exports.searchDuplicateAndIssueReponse = async (
  model,
  resource,
  respondWith,
  options = {}
) => {
  const { reason } = {
    reason: "already taken",
    ...options,
  };

  const { doc, paths } = await model.findDocWithUniquePaths(resource);
  if (doc) {
    paths.forEach((key) => {
      respondWith.error({
        name: key,
        value: resource[key],
        reason,
      });
    });

    return respondWith.alreadyExists();
  }
};


const getUserIdFromRequest = (req) => {
  const authUserId = requestUtils.getDecodedTokenFromRequest(req).payload.user;
  const normUserId = requestUtils.getLastIdParamFromRequest(req);
  const userId = normUserId || authUserId;
  return userId;
};

exports.readUsers = asyncRouteHandler(async (req, res) => {
  const reqDataProcOpts = req.dataProcessingOptions;
  const dbDataProcOpts = mapToDbDataProcessingQueryModel(reqDataProcOpts);
  const usersInDb = User.find(dbDataProcOpts.filters);
  usersInDb.sort(dbDataProcOpts.sorts);
  usersInDb.skip(dbDataProcOpts.payload.offset);
  usersInDb.limit(dbDataProcOpts.payload.limit);
  usersInDb.transform((docs) => docs.map((doc) => doc.leanDoc));

  const retrivedUsers = await usersInDb;
  if (hpFuncs.isEmptyArray(retrivedUsers)) {
    return res.aydinnRes.send
      .context({ message: "There are no users in the database" })
      .notFound();
  }

  const respondWith = res.aydinnRes.send;
  respondWith.meta({ ...reqDataProcOpts });
  reqDataProcOpts.sorts.forEach((s) => respondWith.sort(s));
  for (const keys in reqDataProcOpts.filters) {
    reqDataProcOpts.filters[keys].forEach((f) => respondWith.filter(f));
  }

  let paginatedUsers = retrivedUsers;
  const { pageNumber, pageSize } = dbDataProcOpts.pagination;
  if (pageNumber || pageSize) {
    const { length: itemsSize } = retrivedUsers;
    const paginationDetails = getPaginationDetails(
      pageNumber,
      pageSize,
      itemsSize
    );

    respondWith.page(paginationDetails[0]);
    const { paginateFrom, paginateTo } = paginationDetails[1];
    paginatedUsers = retrivedUsers.slice(paginateFrom, paginateTo);
  }

  return respondWith.data(paginatedUsers).found();
});

exports.createUser = asyncRouteHandler(async (req, res) => {
  const validatedUser = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    User,
    validatedUser,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  const newUser = new User(validatedUser);
  const createdUser = await newUser.save();
  return res.aydinnRes.send.data(createdUser.leanDoc).created();
});

exports.readUser = asyncRouteHandler(async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const userInDb = await User.findById(userId);
  if (!userInDb) return res.aydinnRes.send.notFound();
  return res.aydinnRes.send.data(userInDb.leanDoc).found();
});

exports.updateUser = asyncRouteHandler(async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const userToBeUpdated = await User.findById(userId);
  if (!userToBeUpdated) {
    return res.aydinnRes.send
      .context({ message: `Cannot update a non-existing user` })
      .notFound();
  }

  const validatedUser = req.schemaValidation.success.value;
  const issuedResponse = await searchDuplicateAndIssueReponse(
    User,
    validatedUser,
    res.aydinnRes.send
  );

  if (issuedResponse) return;
  hpFuncs.updateValuesFromProperties(userToBeUpdated, validatedUser);
  const userModified = userToBeUpdated.isModified();
  const updatedUser = await userToBeUpdated.save();
  const respond = res.aydinnRes.send.data(updatedUser.leanDoc);
  if (userModified) return respond.updated();
  return respond.notModified();
});

exports.deleteUser = asyncRouteHandler(async (req, res) => {
  const userId = getUserIdFromRequest(req);
  const deletedUser = await User.deleteOneByProperty("id", userId);
  if (!deletedUser) {
    return res.aydinnRes.send
      .context({ message: "Cannot delete a non-existing user" })
      .notFound();
  }

  return res.aydinnRes.send.data(deletedUser.leanDoc).deleted();
});
