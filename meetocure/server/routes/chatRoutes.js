const express = require("express");
const router = express.Router();
const { chatWithFlaskAI } = require("../controllers/chatCOntroller");

router.post("/chat", chatWithFlaskAI);

module.exports = router;
