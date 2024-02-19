const {
  getItemsWrappedInArray,
  deleteNullUndefinedProperties,
} = require("../utils");

exports.formatting = {
  getValidationErrorItem: (errorItem) => {
    const { name, value, reason } = errorItem;
    if ((name !== 0 && !name) || !reason || typeof reason !== "string") {
      throw new Error("All arguments arevrequired to create an error-item");
    }

    return { name, value, reason };
  },

  validationError: (items, errorObj) => {
    const errors = getItemsWrappedInArray(items);
    const failure = {
      error: errors[0],
      errors,
      exception: errorObj,
    };

    deleteNullUndefinedProperties(failure);
    return { failure };
  },

  validationData: (items) => {
    const values = getItemsWrappedInArray(items);
    const success = {
      value: values[0],
      values,
    };

    deleteNullUndefinedProperties(success);
    return { success };
  },

  fromJoiValidationData: function (validation) {
    return this.validationData(validation);
  },

  fromJoiValidationError: function (validation) {
    return this.validationError(
      validation.details.map((error) => {
        return this.getValidationErrorItem({
          name: error.context.label,
          value: error.context.value,
          reason: error.message,
        });
      }),
      validation
    );
  },

  fromJoiValidation: function (validation) {
    const { error, value } = validation;
    if (error) return this.fromJoiValidationError(error);
    if (value) return this.fromJoiValidationData(value);
    throw new Error(`Received "undefined" as validation result to format`);
  },
};
