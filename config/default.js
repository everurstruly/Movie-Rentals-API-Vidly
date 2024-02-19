module.exports = {
  server: {
    protocol: "http",
    domain: "localhost",
    port: 3000,
    apiPrefix: "api",
    apiVersionNumber: "1",
  },
  database: {
    protocol: "mongo",
    domain: "localhost",
    port: 27017,
    name: "test",
    username: "",
    password: "",
    query: "",
  },
  logging: {
    hostsToWatch: "",
    errorsToIgnore: "",
  },
  cors: {
    allowApiDevToolsOrigin: false,
    allowedOrigins: "",
  },
  jwt: {
    issuer: {
      email: "",
      site: "",
    },
    secret: {
      privateAccessKey: "",
      privateRefreshKey: "",
    },
  },
  
};
