const mongoose = require("mongoose");
const myModelPlugin = require("./_plugin");

const sessionAdminSchema = new mongoose.Schema({
  admin: {
    type: mongoose.ObjectId,
    ref: "Admin",
    required: true,
  },
  refreshToken: String,
  refreshTokenFamily: [String],
});

sessionAdminSchema.plugin(myModelPlugin);

sessionAdminSchema.method("deleteJwtRefreshTokenAndFamily", async function () {
  this.refreshToken = "";
  this.refreshTokenFamily = [];
});

sessionAdminSchema.pre("save", async function (next) {
  if (!this.refreshTokenFamily.includes(this.refreshToken)) {
    this.refreshTokenFamily.push(this.refreshToken);
  }

  return next();
});

sessionAdminSchema.plugin(myModelPlugin);
const SessionAdminModel = mongoose.model("SessionAdmin", sessionAdminSchema);
module.exports = SessionAdminModel;
