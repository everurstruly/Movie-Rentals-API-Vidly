const config = require("../helpers/config");

module.exports = async (app) => {
  await app.listen(config.get("server.port"));
  return config.do.getServerUrl();
};
