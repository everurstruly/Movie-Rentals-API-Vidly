const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const getLeanWindowsExceptionStack = (stack) => {
  const traces = stack.split("at ");
  let traceTargetIndex = -1;
  for (let traceIndex = 0; traceIndex < traces.length; traceIndex++) {
    const currTrace = traces[traceIndex];
    if (currTrace.trim().startsWith("C:")) traceTargetIndex = traceIndex;
  }

  return traceTargetIndex > -1 ? traces[traceTargetIndex].trim() : undefined;
};

const getLogInfoFromError = (error) => {
  const timestamp = new Date().toISOString();
  const uuid = crypto.randomUUID();
  const stack = `at ${error.stack}`;
  const log = [
    `"timestamp": ${timestamp}`,
    `\t\t"uuid": ${uuid}`,
    `\t\t"stack": ${stack}`,
    `\n\n`,
  ];

  return log.join("");
};

const getLogInfoFromRequest = (req) => {
  const timestamp = new Date().toISOString();
  const uuid = crypto.randomUUID();
  const host = req.headers.host;
  const message = `${req.method.toUpperCase()} ${req.originalUrl}`;
  const log = [
    `"timestamp": ${timestamp}`,
    `\t\t"uuid": ${uuid}`,
    `\t\t"host": ${host}`,
    `\t\t"message": ${message}`,
    "\n",
  ];

  return log.join("");
};

exports.makeLogFileInfo = function (fileName) {
  const folderPath = path.join(__dirname, "..", "..", "logs");
  const filePath = path.join(folderPath, `${fileName}.log`);
  return { folderPath, filePath, fileName };
};

exports.logRequest = (req, filePath) => {
  const log = getLogInfoFromRequest(req);
  fs.appendFile(filePath, log, "utf-8", (error) => {
    if (error) throw error;
  });
};

exports.logError = (error, filePath) => {
  const log = getLogInfoFromError(error);
  fs.appendFile(filePath, log, "utf-8", (error) => {
    if (error) throw error;
  });
};
