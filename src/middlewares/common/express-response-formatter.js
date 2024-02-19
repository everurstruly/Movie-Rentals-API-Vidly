const utils = require("../utils");

const STATUS_CODE_INFO_MAPPINGS = Object.freeze({
  200: {
    name: "ok",
    message: "OK",
  },
  201: {
    name: "created",
    message: "Created",
  },
  400: {
    name: "badRequest",
    message: "Bad Request",
  },
  401: {
    name: "unauthorized",
    message: "Unauthorized",
  },
  403: {
    name: "forbidden",
    message: "Forbidden",
  },
  404: {
    name: "notFound",
    message: "Not found",
  },
  406: {
    name: "notAcceptable",
    message: "Not acceptable",
  },
  405: {
    name: "methodNotAllowed",
    message: "Method not allowed",
  },
  408: {
    name: "timeout",
    message: "Timeout",
  },
  409: {
    name: "conflict",
    message: "Conflict",
  },
  429: {
    name: "tooManyRequests",
    message: "Too many requests",
  },
  500: {
    name: "serverError",
    message: "Internal server error",
  },
  502: {
    name: "badGateway",
    message: "Bad gateway",
  },
  503: {
    name: "serviceUnavailable",
    message: "Service unavailable",
  },
  504: {
    name: "gatewayTimeout",
    message: "Gateway timeout",
  },
});

class HttpResponse {
  constructor(code, context, handleSend) {
    this.code = code;
    this._context = {
      type: context.type || "",
      action: context.action || "",
      message: context.message || "",
    };

    this._meta = {};
    this._snowballedMeta = {};
    this._snowballedPayload = {};
    this._handleSend = handleSend;
  }

  getResponseMessage = function () {
    const { type, action, message } = this._context;
    if (message) return message;
    if (type && action) return `${type} ${action}`;
    const status = STATUS_CODE_INFO_MAPPINGS[this.code] || {};
    return status.message || "";
  };

  getResponse = function () {
    return {
      context: {
        code: this.code,
        ...this._context,
        message: this.getResponseMessage(),
      },
      payload: {
        ...this._snowballedPayload,
      },
      meta: {
        ...this._meta,
        ...this._snowballedMeta,
      },
    };
  };

  send = function () {
    return this._handleSend(this.getResponse());
  };

  context = function (ctx) {
    // { type, action, message };
    const updatedCtx = { ...this._context };
    utils.updateValuesFromProperties(updatedCtx, ctx);
    this._context = { ...updatedCtx };
    return this;
  };

  data = function (...items) {
    const key = "data";
    const firstItem = items[0];
    if (items.length === 1 && Array.isArray(firstItem)) {
      this._snowballedPayload[key] = firstItem;
      return this;
    }

    this._snowballedPayload[key] = items;
    return this;
  };

  errors = function (...items) {
    // { name, value, reason }[]
    const key = "errors";
    const firstItem = items[0];
    if (items.length === 1 && Array.isArray(firstItem)) {
      this._snowballedPayload[key] = firstItem;
      return this;
    }

    this._snowballedPayload[key] = items;
    return this;
  };

  meta = function (item) {
    this._meta = item;
    return this;
  };

  sorts = function (...items) {
    // { field, order }[]
    const key = "sorts";
    const firstItem = items[0];
    if (items.length === 1 && Array.isArray(firstItem)) {
      this._snowballedMeta[key] = firstItem;
      return this;
    }

    this._snowballedMeta[key] = items;
    return this;
  };

  filters = function (...items) {
    // { field, property, operator }[]
    const key = "filters";
    const firstItem = items[0];
    if (items.length === 1 && Array.isArray(firstItem)) {
      this._snowballedMeta[key] = firstItem;
      return this;
    }

    this._snowballedMeta[key] = items;
    return this;
  };

  page = function (item) {
    // {
    //   currentPage:,
    //   totalPages:,
    //   itemsPerPage:,
    //   itemsTotalSize:,
    //   nextPage:,
    //   prevPage:,
    // }
    this._snowballedMeta.pagination = item;
    return this;
  };
}

class HttpResponseFormatter {
  static accessor = "aydinnRes";

  constructor(expressRes) {
    this.response = expressRes;
  }

  #getResponseBody = (options) => {
    const { code, message } = options.context;
    const { data, errors } = options.payload;
    const { meta } = options;
    const responseType = code > 0 && code < 400 ? "data" : "error";
    const itemsToSend = responseType === "data" ? data : errors;
    const items = utils.getItemsWrappedInArray(itemsToSend);
    const responseContent = { code, message, items, meta };
    utils.deleteFalsyProperties(responseContent);
    utils.deleteFalsyProperties(responseContent.meta, true);
    return { [responseType]: responseContent };
  };

  #sendResponse = (options) => {
    const resBody = this.#getResponseBody(options);
    return this.response.status(options.context.code).json(resBody);
  };

  send = {
    ...new HttpResponse(null, {}, this.#sendResponse),
    ok: function () {
      this.code = 200;
      return this.send();
    },
    found: function () {
      this.code = 200;
      return this.send();
    },
    created: function () {
      this.code = 201;
      return this.send();
    },
    updated: function () {
      this.code = 200;
      return this.send();
    },
    deleted: function () {
      this.code = 200;
      return this.send();
    },
    notModified: function () {
      this.code = 304;
      return this.send();
    },
    badRequest: function () {
      this.code = 400;
      return this.send();
    },
    unauthorized: function () {
      this.code = 401;
      return this.send();
    },
    alreadyExists: function () {
      this.code = 403;
      return this.send();
    },
    forbidden: function () {
      this.code = 403;
      return this.send();
    },
    doesNotExist: function () {
      this.code = 404;
      return this.send();
    },
    notFound: function () {
      this.code = 404;
      return this.send();
    },
    unexpected: function () {
      this.code = 500;
      return this.send();
    },
    unavailable: function () {
      this.code = 503;
      return this.send();
    },
  };

  // ok = new HttpResponse(200, {}, this.#sendResponse);
  // created = new HttpResponse(201, {}, this.#sendResponse);
  // updated = new HttpResponse(200, {}, this.#sendResponse);
  // deleted = new HttpResponse(200, {}, this.#sendResponse);
  // notModified = new HttpResponse(304, {}, this.#sendResponse);
  // badRequest = new HttpResponse(400, {}, this.#sendResponse);
  // unauthorized = new HttpResponse(401, {}, this.#sendResponse);
  // alreadyExists = new HttpResponse(403, {}, this.#sendResponse);
  // forbidden = new HttpResponse(403, {}, this.#sendResponse);
  // doesNotExist = new HttpResponse(404, {}, this.#sendResponse);
  // notFound = new HttpResponse(404, {}, this.#sendResponse);
  // unexpected = new HttpResponse(500, {}, this.#sendResponse);
  // unavailable = new HttpResponse(503, {}, this.#sendResponse);
}

module.exports = (accessor) => (_, res, next) => {
  const accessor_ = accessor || HttpResponseFormatter.accessor;
  const formatter = new HttpResponseFormatter(res);
  res[accessor_] = formatter;
  return next();
};
