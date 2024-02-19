const mongoose = require("mongoose");
const myModelPlugin = require("../lib/my-mongoose-plugin");

const genreSchema = new mongoose.Schema(
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

genreSchema.plugin(myModelPlugin);
const GenreModel = mongoose.model("Genre", genreSchema);
module.exports = GenreModel;
