const express = require("express");

const router = express.Router();

router.all("/", (req, res) => {
  return res.send({ message: "health-check" });
});

router.all("/test", (req, res) => {
  try {
    console.log('req.dataProcessing -', req.dataProcessingQuery);
    res.json("HI");
  } catch (error) {
    console.log('test (error) -', error);
  }
});

module.exports = router;
