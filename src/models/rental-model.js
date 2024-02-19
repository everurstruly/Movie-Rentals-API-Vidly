const mongoose = require("mongoose");
const myModelPlugin = require("../lib/my-mongoose-plugin");
const utilFuncs = require("../helpers/util-funcs");

const RENT_MAX_aDURATION = '30dy'; // 30 days

const rentalPurchaseSchema = new mongoose.Schema({
  movie: {
    type: mongoose.ObjectId,
    ref: "Movie",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  }
});

const rentalOutSchema = new mongoose.Schema({
  at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  byAdmin: {
    type: mongoose.ObjectId,
    ref: "Admin",
    immutable: true,
    required: true,
  },
});


const rentalReturnSchema = new mongoose.Schema({
  expectedAt: {
    type: Date,
    default: function () {
      const timeRented_ms = this.out.at.getTime();
      const timeRentedFor_ms = utilFuncs.getTimeInMilliSeconds(RENT_MAX_aDURATION);
      const timeExpectedReturn_ms = timeRented_ms + timeRentedFor_ms;
      return new Date(timeExpectedReturn_ms);
    },
  },
  at: {
    type: Date,
    default: null,
  },
  byAdmin: {
    type: mongoose.ObjectId,
    ref: "Admin",
    default: null,
  },
  lateFee: {
    type: Number,
  },
  
});

const rentalLastModifiedSchema = new mongoose.Schema({
  at: {
    type: Date,
    default: () => Date.now(),
  },
  byAdmin: {
    type: mongoose.ObjectId,
    ref: "Admin",
    required: true,
  },
});

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: "User",
    required: true,
  },
  purchases: {
    type: [rentalPurchaseSchema],
    required: true,
    min: 1,
  },
  out: {
    type: rentalOutSchema
  },
  return: {
    type: rentalReturnSchema
  },
  lastModified: {
    type: rentalLastModifiedSchema
  },
});

rentalSchema.plugin(myModelPlugin);

rentalSchema.pre("save", function (next) {
  if (!this.isNew && !this.modifiedPaths().includes("return")) {
    this.lastModified.at = new Date().toISOString();
  }

  return next();
});

const RentalModel = mongoose.model("Rental", rentalSchema);
module.exports = RentalModel;
