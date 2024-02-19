module.exports = {
  server: {
    protocol: "http",
    domain: "localhost",
    port: 3000,
    apiPrefix: "api",
    apiVersionNumber: "1",
  },
  database: {
    protocol: "mongodb", // "mongodb+srv"
    domain: "localhost", // "cluster5-eeev8.mongodb.net"
    port: 27017, // ""
    name: "vidly-movie-rentals-api-js",
    username: "", // username
    password: "", // password
    query: "", // retryWrites=true
  },
  logging: {
    hostsToWatch: "",
    errorsToIgnore: "",
  },
  cors: {
    allowApiDevToolsOrigin: true,
    allowedOrigins: `http://localhost:3000`,
  },
  jwt: {
    issuer: {
      email: "oghenetefa@gmail.com",
      site: "https://github.com/oghenetefa",
    },
    secret: {
      privateAccessKey: "unsecure-access-key",
      privateRefreshKey: "unsecure-refresh-key",
    },
  },
};
