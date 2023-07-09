const express = require("express");

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

module.exports = router;
