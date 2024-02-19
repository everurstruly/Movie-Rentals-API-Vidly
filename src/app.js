const express = require("express");
const startupDb = require("./startup/database");
const mountRoutes = require("./startup/routes");
const startServer = require("./startup/server");

const app = express();

module.exports = async () => {
  try {
    console.log("* Setting up requirements...");
    await startupDb();
    console.log("* Connected to Database!");
    await mountRoutes(app);
    const serverUrl = await startServer(app);
    console.log(`* Live at "${serverUrl}"\n`);
  } catch (error) {
    console.log(`* Error (app.js)`, error);
  }
};
