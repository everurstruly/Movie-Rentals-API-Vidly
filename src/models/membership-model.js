const mongoose = require("mongoose");
const myModelPlugin = require("../lib/my-mongoose-plugin");

const membershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    isDiscontinued: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true }
);

membershipSchema.plugin(myModelPlugin);
const MembershipModel = mongoose.model("Membership", membershipSchema);
module.exports = MembershipModel;
