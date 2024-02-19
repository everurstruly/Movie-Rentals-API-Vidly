const path = require("path");
const express = require("express");

const publicDirPath = path.join(__dirname, "..", "..", "public");
const router = express.Router();

router.use(express.static(publicDirPath));

module.exports = router;