const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    genresIds: {
      type: [mongoose.ObjectId],
      ref: "Genre",
      required: true,
      min: 1,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
    },
    audienceMinAge: {
      type: Number,
      rquired: true,
      min: 1,
      max: 250,
    },
  },
  { timestamp: true }
);

const MovieModel = mongoose.model("Movie", movieSchema);
module.exports = MovieModel;
