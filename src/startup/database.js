const mongoose = require("mongoose");
const config = require("../helpers/config");

module.exports = async () => {
  mongoose.set("strictQuery", false);
  const dbConnection = await mongoose.connect(config.do.getDbUri());
  return dbConnection;
};
