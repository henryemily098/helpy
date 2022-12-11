const router = require("express").Router();

router.use("/client", require("./client"));

module.exports = router;