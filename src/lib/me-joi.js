const mongoose = require("mongoose");
const Joi = require("joi");

const myJoiExtension = (joi) => ({
  base: Joi.string(),
  name: "MongooObjectId",
  language: "value: {{#label}} is not a Invalid MongoDb ObjectId",
  rules: [
    {
      name: "MongooObjectId",
      validate(value, helpers, arts, rule) {
        if (mongoose.isValidObjectId(value)) return value;
        return helpers.error(400, "Invalid MongooObjectId");
      },
    },
  ],
});

module.exports = Joi.extend(myJoiExtension);
