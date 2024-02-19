const parseStringsInObject = require("parse-strings-in-object");
const parseObjectInString = require("parse-string-data");

exports.parseDataTypeInString = (dataTypesToIgnore = []) => {
  return (strToParse) => {
    const ignoredDataTypes = ["array", "objectLiteral", ...dataTypesToIgnore];
    const { value: parsedStr } = parseStringsInObject({ value: strToParse });
    for (let dataType of ignoredDataTypes) {
      if (
        typeof parsedStr === dataType ||
        (dataType === "array" && Array.isArray(parsedStr)) ||
        (dataType === "objectLiteral" && exports.isObjectLiteral(parsedStr))
      ) {
        return strToParse;
      }
    }

    return parsedStr;
  };
};

(function () {
  // fuck it
})();
