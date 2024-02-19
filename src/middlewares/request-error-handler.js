const defaultOptions = {
  fowardError: false,
};

module.exports = (options = {}) => {
  return (error, req, res, next) => {
    const { name: errName, message: errMsg } = error;

    const { fowardError } = {
      ...defaultOptions,
      ...options,
    };

    if (errName === "CastError") {
      const { path: name, value, valueType, kind } = error;
      const message = "Invalid query string value";
      const reason = `Received '${valueType}' instead of '${kind}' dataType`;
      return res.aydinnRes.send
        .context({ message })
        .error({ name, value, reason })
        .badRequest();
    }

    const isJsonBodyError =
      errMsg.indexOf("Unexpected") > -1 && errMsg.indexOf("JSON") > -1;

    if (
      isJsonBodyError ||
      errName === "CORS" ||
      errName === "JsonWebTokenError"
    ) {
      return res.aydinnRes.send.context({ message: errMsg }).badRequest();
    }

    if (errName === "JsonWebTokenPayloadValidationError") {
      return res.aydinnRes.send
        .context({ message: "Invalid token" })
        .unauthorized();
    }

    if (errName === "TokenExpiredError") {
      const reqTokenError = req.tokenError || {};
      const { name, token } = {
        name: "token",
        token: undefined,
        ...reqTokenError,
      };

      return res.aydinnRes.send
        .error({ name, value: token, reason: errMsg })
        .unauthorized();
    }

    if (fowardError) next(error);
    return res.aydinnRes.send.unexpected();
  };
};
