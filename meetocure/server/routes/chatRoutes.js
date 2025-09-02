// routes/chatRoutes.js
const express = require("express");
const { chatWithFlaskAI, deleteChatsForPatient } = require("../controllers/chatCOntroller");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", chatWithFlaskAI);

// Delete all chats for a patient
// DELETE /api/chat/all/:patientId
router.delete("/all/:patientId", deleteChatsForPatient);

module.exports = router;
