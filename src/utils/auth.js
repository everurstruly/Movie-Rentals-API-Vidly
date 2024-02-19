const config = require("./config");
const { getTimesAsMilliSeconds } = require("../utils");

exports.AuthTokenCookie = class {
  constructor(name, options) {
    this.name = name;
    this.options = options || this.#defaultOptions;
  }

  #defaultOptions = {
    domain: config.server.domain,
    sameSite: "None",
    httpOnly: true,
    secure: true,
    maxAge: getTimesAsMilliSeconds("1hr"),
  };

  overwriteOptions = function (options = {}) {
    const overwrittenOptions = { ...this.options, ...options };
    this.options = overwrittenOptions;
  };

  set = function (res, token) {
    res.cookie(this.name, `Bearer ${token}`, this.options);
  };

  clear = function (res) {
    res.clearCookie(this.name, this.options);
  };
};


exports.utils = {
  getTokenAttributes: (_token = "") => {
    if (!_token) return {};
    const _tokenSplitted = _token.split(" ");
    if (_tokenSplitted.length === 2) {
      const [type, token] = _tokenSplitted;
      return { type, token, value: _token };
    }

    const [token] = _tokenSplitted;
    return { type: null, token, value: _token };
  },
  getTokenFromAuthorizationHeader: function (authHeader = "", tokenType = "") {
    const tokens = authHeader.split(",").reduce((authTokens, token) => {
      const tokenTrimmed = token.trim();
      if (!tokenTrimmed) return authTokens;
      const tokenAttributes = this.getTokenAttributes(tokenTrimmed);
      authTokens[tokenAttributes.type] = tokenAttributes;
      return authTokens;
    }, {});

    return tokens[tokenType] || {};
  },
};
