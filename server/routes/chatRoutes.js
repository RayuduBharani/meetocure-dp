// routes/chatRoutes.js
const express = require("express");
const { 
  chatWithFlaskAI, 
  deleteChatsForPatient, 
  chatWithVoice,
  doctorChatWithAI,
  getDoctorAIChats,
  deleteDoctorAIChats
} = require("../controllers/chatCOntroller");
const protect = require("../middleware/authMiddleware");
const multer = require("multer"); 
const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

router.post("/", chatWithFlaskAI);

// Voice chat endpoint
// POST /api/chat/voice
router.post("/voice", function(req, res, next) {
  upload.single('audio')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ message: "Error uploading file", error: err.message });
    }
    next();
  });
}, chatWithVoice);


// Delete all chats for a patient
// DELETE /api/chat/all/:patientId
router.delete("/all/:patientId", deleteChatsForPatient);

// Doctor AI chat routes
router.post("/doctor", protect(["doctor"]), doctorChatWithAI);
router.get("/doctor/:doctorId", protect(["doctor"]), getDoctorAIChats);
router.delete("/doctor/:doctorId", protect(["doctor"]), deleteDoctorAIChats);

module.exports = router;
