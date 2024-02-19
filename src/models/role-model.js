const mongoose = require("mongoose");
const myModelPlugin = require("../lib/my-mongoose-plugin");

const roleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    isDiscontinued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true }
);

roleSchema.plugin(myModelPlugin);
const RoleModel = mongoose.model("Role", roleSchema);
module.exports = RoleModel;
