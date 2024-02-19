const mongoose = require("mongoose");
const asyncMiddlewareFunc = require("./common/async-middleware-function");
const { paramUtils } = require("../../lib/express-http-helpers");
const hpFuncs = require("../../lib/helper-functions");

const defaultOptions = {
  autoRespondIfInvalid: true,
  message: "Invalid Id param recieved",
};

module.exports = (options = {}) => {
  return asyncMiddlewareFunc(async (req, res, next) => {
    const { autoRespondIfInvalid, message } = {
      ...defaultOptions,
      ...options,
    };

    const idsParamKeys = paramUtils.getKeysOfIdsParam(req.params);
    if (hpFuncs.isEmptyArray(idsParamKeys)) return next();
    const idsParamValues = idsParamKeys.map((key) => req.params[key]);
    const isValidIds = idsParamValues.reduce((validationsResult, id) => {
      validationsResult[id] = mongoose.isValidObjectId(id);
      return validationsResult;
    }, {});

    const lastIdParamKeyIdx = idsParamKeys.length - 1;
    const lastIdParamKey = idsParamKeys[lastIdParamKeyIdx];

    req[lastIdParamKey] = idsParamValues[lastIdParamKeyIdx];
    req.idParamKey = lastIdParamKey;
    req.idsParamKeys = idsParamKeys;
    req.idsParamValues = idsParamValues;

    for (let id of Object.keys(isValidIds)) {
      if (autoRespondIfInvalid && !isValidIds[id]) {
        return res.aydinnRes.send.context({ message }).badRequest();
      }
    }

    return next();
  });
};
