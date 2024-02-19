module.exports = (middleware) => {
  return async (req, res, next) => {
    try {
      const result = await middleware(req, res, next);
      return result;
    } catch (error) {
      return next(error);
    }
  };
};
