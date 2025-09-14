const express = require("express");
const router = express.Router();
const { searchAll } = require("../controllers/searchController");

// Public Search Route
router.get("/", searchAll);

module.exports = router;
