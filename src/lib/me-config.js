const nodeconfig = require("config");

nodeconfig.do.getAsApiRoute = (url) => {
  const { apiPrefix, apiVersionNumber } = nodeconfig.get("server");
  return `/${apiPrefix}/v${apiVersionNumber}${url}`;
};

nodeconfig.do.getServerUrl = () => {
  const { protocol, domain, port } = nodeconfig.get("server");
  return `${protocol}://${domain}:${port}`;
};

nodeconfig.do.getDbUri = () => {
  const {
    connectionString,
    protocol,
    domain,
    name,
    port,
    username,
    password,
    query,
  } = nodeconfig.get("database");

  if (connectionString) return connectionString;
  const _port = port ? `:${port}` : "";
  const _query = query ? `?${query}` : "";
  const credentials = username && password ? `${username}:${password}@` : "";
  return `${protocol}://${credentials}${domain}${_port}/${name}${_query}`;
};

module.exports = nodeconfig;
