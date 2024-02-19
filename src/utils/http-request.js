exports.utils = {
  getKeysOfIdsParam: (params) => {
    return Object.keys(params).reduce((ids, key) => {
      if (key === "id" || key.slice(-2) === "Id") {
        ids.push(key);
      }

      return ids;
    }, []);
  },
  getKeyOfIdParam: (params) => {
    const idParamKeys = this.getKeysOfIdsParam(params);
    const targetIdParamIndex = idParamKeys.length - 1;
    return idParamKeys[targetIdParamIndex] || undefined;
  },
  getLastIdParamFromRequest: (req) => {
    const { idParamKey } = req;
    if (!idParamKey) return undefined;
    return req.params[idParamKey];
  },
  getDecodedTokenFromRequest: (req) => {
    const { decodedTokenName } = req;
    if (!decodedTokenName) return undefined;
    return req[decodedTokenName];
  },
};


exports.routeUtils = {
  withApiPrefix: (url) => {
    const { apiPrefix, apiVersionNumber } = config.server;
    return `/${apiPrefix}/v${apiVersionNumber}${url}`;
  },
};

exports.paramUtils = {
  getKeysOfIdsParam: (params) => {
    return Object.keys(params).reduce((ids, key) => {
      if (key === "id" || key.slice(-2) === "Id") {
        ids.push(key);
      }

      return ids;
    }, []);
  },
  getKeyOfIdParam: (params) => {
    const idParamKeys = this.getKeysOfIdsParam(params);
    const targetIdParamIndex = idParamKeys.length - 1;
    return idParamKeys[targetIdParamIndex];
  },
};

exports.requestUtils = {
  getLastIdParamFromRequest: (req) => {
    const { idParamKey } = req;
    if (!idParamKey) return undefined;
    return req.params[idParamKey];
  },
  getDecodedTokenFromRequest: (req) => {
    const { decodedTokenName } = req;
    if (!decodedTokenName) return undefined;
    return req[decodedTokenName];
  },
};
