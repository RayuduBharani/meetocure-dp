// controllers/chatController.js
const axios = require("axios");
const Chat = require("../models/Chat");
const Patient = require("../models/Patient");

const chatWithFlaskAI = async (req, res) => {
  try {
    const { patientId, message } = req.body;

    if (!patientId || !message) {
      return res.status(400).json({ message: "patientId and message are required" });
    }

    // verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // save patient message
    await Chat.create({
      patient: patient._id,
      role: "patient",
      message,
    });

    // send to Flask AI
    const flaskBase = "http://127.0.0.1:8000"; // update if needed
    const flaskResponse = await axios.post(
      `${flaskBase}/assistance`,
      { text: message }   // must match FastAPI schema
    );

    // accept either 'reply' (FastAPI) or 'answer' (older expectation)
    const data = flaskResponse.data || {};
    const aiMessage = data.reply || data.answer || "No response from AI.";
    const sources = data.sources || [];

    // save AI response
    await Chat.create({
      patient: patient._id,
      role: "ai",
      message: aiMessage,
      sources,
    });

    return res.status(200).json({
      answer: aiMessage,
      success: true,
      sources,
    });

  } catch (error) {
    console.error("Error communicating with Flask chatbot:", error?.message || error);
    return res.status(500).json({
      message: "Flask AI service error",
      error: error?.message || String(error),
    });
  }
};

const deleteChatsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // delete all chat documents for this patient
    await Chat.deleteMany({ patient: patient._id });

    return res.status(200).json({ success: true, message: "All chats deleted for patient" });
  } catch (error) {
    console.error("Error deleting chats:", error?.message || error);
    return res.status(500).json({ success: false, message: "Server error", error: error?.message || String(error) });
  }
};

module.exports = { chatWithFlaskAI, deleteChatsForPatient };
