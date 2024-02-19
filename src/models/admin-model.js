const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const myModelPlugin = require("../lib/my-mongoose-plugin");

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      required: true,
    },
    lastName: {
      type: String,
      lowercase: true,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      maxLength: 1024,
      required: true,
    },
    assignedRolesIds: {
      type: [mongoose.Types.ObjectId],
      ref: "Role",
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true }
);

adminSchema.plugin(myModelPlugin, {
  pathsToLeanOut: ["__v", "password"],
  virtualsNotToLeanOut: ["displayName"],
});

adminSchema.virtual("displayName", function () {
  const uid = this._id.toString().slice(-3);
  return `${this.firstName}#${uid}${this.age}`;
});

adminSchema.pre("save", async function (next) {
  const modifiedPaths = this.modifiedPaths();
  if (this.isNew || modifiedPaths.includes("password")) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  }

  return next();
});

adminSchema.method("matchesPwdInDb", async function (password) {
  const matches = await bcrypt.compare(password, this.password);
  return matches;
});

adminSchema.method("getJwtAccessToken", async function (options = {}) {
  const { secret, ...tokenOptions } = options;
  return jwt.sign(
    {
      packet: {
        admin: this._id,
        isSuspended: this.isSuspended,
        assignedRoles: this.assignedRoles,
      },
    },
    secret,
    {
      expiresIn: "15sec",
      ...tokenOptions,
    }
  );
});

adminSchema.method("getJwtRefreshToken", async function (options = {}) {
  const { secret, ...tokenOptions } = options;
  return jwt.sign(
    {
      packet: {
        admin: this._id,
        isSuspended: this.isSuspended,
      },
    },
    secret,
    {
      expiresIn: "10min",
      ...tokenOptions,
    }
  );
});

const AdminModel = mongoose.model("Admin", adminSchema);
module.exports = AdminModel;
