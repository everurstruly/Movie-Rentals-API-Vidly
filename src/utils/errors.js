
exports.tokenErrors = {
  JsonWebTokenError: function () {
    const newError = new Error("Invalid Token");
    newError.name = "JsonWebTokenError";
    return newError;
  },

  TokenExpiredError: function () {
    const newError = new Error("Expired");
    newError.name = "TokenExpiredError";
    return newError;
  },

  TokenExpiredSessionError: function () {
    const newError = new Error("Expired Session");
    newError.name = "TokenExpiredError";
    return newError;
  },

  TokenPayloadValidationError: function (msg) {
    const errorMsg = msg || "Invalid token payload schema";
    const newError = new Error(errorMsg);
    newError.name = "TokenPayloadValidationError";
    return newError;
  },
};