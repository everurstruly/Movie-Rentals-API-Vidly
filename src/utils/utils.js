// number utils
exports.getRandomInt = (min, max) => {
  //The maximum is exclusive and the minimum is inclusive
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

// string utils
const capFirstLetter = (word = "") => {
  return `${word[0].toUpperCase()}${word.slice(1)}`;
};

const deCapFirstLetter = (word = "") => {
  return `${word[0].toLowerCase()}${word.slice(1)}`;
};

const toCamelCase_ = ({
  sentense = "",
  initWordSeperator = " ",
  finalWordSeperator = "",
}) => {
  return sentense
    .split(initWordSeperator)
    .map((word, index) => {
      if (index === 0) return deCapFirstLetter(word);
      return capFirstLetter(word);
    })
    .join(finalWordSeperator);
};

const toPascalCase_ = ({
  sentense = "",
  initWordSeperator = " ",
  finalWordSeperator = "",
}) => {
  return sentense
    .split(initWordSeperator)
    .map((word) => capFirstLetter(word))
    .join(finalWordSeperator);
};

exports.toTitleCase = (sentense) => {
  return toPascalCase_({ sentense, finalWordSeperator: " " });
};

exports.textToCamelCase = (sentense) => {
  return toCamelCase_({ sentense });
};

exports.textToPascalCase = (sentense) => {
  return toPascalCase_({ sentense });
};

exports.hypenToCamelCase = (sentense) => {
  return toCamelCase_({ sentense, initWordSeperator: "-" });
};

exports.hypenToPascalCase = (sentense = "") => {
  return toPascalCase_({ sentense, initWordSeperator: "-" });
};

// array utils
exports.makePropertyAvailableAsArray = (obj, key) => {
  if (!obj[key]) obj[key] = [];
  return obj;
};

exports.isEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length < 1;
};

exports.getItemsWrappedInArray = (items) => {
  if (Array.isArray(items)) return items;
  if (items) return [items];
  return undefined;
};

exports.removeItemFromArray = (itemToBeRemoved, arr, removeItemWhereTrue) => {
  let itemToBeRemovedIndex = arr.indexOf(itemToBeRemoved);
  if (removeItemWhereTrue) {
    itemToBeRemovedIndex = arr.findIndex(removeItemWhereTrue);
  }

  const isAbsIndex = (index) => index >= 0;
  if (!isAbsIndex(itemToBeRemovedIndex)) return undefined;
  return arr.splice(itemToBeRemovedIndex, 1)[0];
};

// object utils
exports.isObjectLiteral = (value) => {
  return value && typeof value === "object" && value.constructor === Object;
};

exports.isEmptyObject = (value) => {
  return exports.isObjectLiteral(value) && Object.keys(value).length < 1;
};

exports.pickProperties = (keys, obj) => {
  return keys.reduce((picked, key) => {
    picked[key] = obj[key];
    return picked;
  }, {});
};

exports.updateValuesFromProperties = (objToUpdate, objWithUpdates) => {
  const { isObjectLiteral, updateValuesFromProperties } = exports;
  if (!isObjectLiteral(objToUpdate) || !isObjectLiteral(objWithUpdates)) {
    return undefined;
  }

  for (const key in objWithUpdates) {
    const valueToUpdate = objToUpdate[key];
    const valueWithUpdate = objWithUpdates[key];
    if (isObjectLiteral(valueToUpdate)) {
      updateValuesFromProperties(valueToUpdate, valueWithUpdate);
    } else {
      objToUpdate[key] = valueWithUpdate;
    }
  }

  return { ...objToUpdate };
};

exports.deleteFalsyProperties = (obj, recursively) => {
  const isFalsyValue = (value) => {
    return (
      !value || exports.isEmptyArray(value) || exports.isEmptyObject(value)
    );
  };

  if (!exports.isObjectLiteral(obj)) return undefined;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (recursively && exports.isObjectLiteral(value)) {
      exports.deleteFalsyProperties(value, recursively);
    } else {
      if (isFalsyValue(value)) delete obj[key];
    }
  }
};

exports.deleteNullUndefinedProperties = (obj) => {
  if (!exports.isObjectLiteral) return undefined;
  for (const key in obj) {
    const value = obj[key];
    if (value === undefined || value === null) delete obj[key];
  }

  return obj;
};

// time utils
const a_second_ms = 1000;
const a_minute_ms = 60 * a_second_ms;
const a_hour_ms = 60 * a_minute_ms;
const a_day_ms = 24 * a_hour_ms;
const a_week_ms = 7 * a_day_ms;
const baseTimesInMilliSeconds = {
  ms: 1,
  mn: a_minute_ms,
  sc: a_second_ms,
  hr: a_hour_ms,
  dy: a_day_ms,
  wk: a_week_ms,
};

const convertTimeToMilliSeconds = (time) => {
  // convertTimeToMilliSeconds(20dy);
  const timeDigit = parseInt(time);
  const timeUnit = time.slice(`${timeDigit}`.length);
  return timeDigit * baseTimesInMilliSeconds[timeUnit];
};

const convertMilliSecondsToTime = (time_ms) => {
  // convertMilliSecondsToTime(0000000dy);
  const timeDigit = parseInt(time_ms);
  const timeUnit = time_ms.slice(`${timeDigit}`.length);
  return timeDigit / baseTimesInMilliSeconds[timeUnit];
};

exports.getTimesAsMilliSeconds = (...times) => {
  return times.reduce((total, time) => {
    return total + convertTimeToMilliSeconds(time);
  }, 0);
};

exports.getMilliSecondsAsTime = (...times_ms) => {
  return times_ms.reduce((total, time) => {
    return Math.floor(total + convertMilliSecondsToTime(time));
  }, 0);
};

// dotenv (environment variable) utils
exports.getEnvValueAsArray = (value) => {
  return value
    .split(",")
    .map((items) => items.trim())
    .filter((i) => i);
};

exports.getEnvValueAsBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.toLowerCase() === "true") return true;
  return false;
};

// @param dataOfBirth {string (iso)}
const getAgeFromDob = (dateOfBirth) => {
  const presentYear = new Date().getFullYear();
  const dobYear = new Date(dateOfBirth).getFullYear();
  return presentYear - dobYear;
};
