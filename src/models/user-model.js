const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    memberships: {
      type: [mongoose.ObjectId],
      ref: "Membership",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true }
);

userSchema.virtual("age").get(function () {
  const presentYear = new Date().getFullYear();
  const dobYear = this.dateOfBirth.getFullYear();
  return presentYear - dobYear;
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
