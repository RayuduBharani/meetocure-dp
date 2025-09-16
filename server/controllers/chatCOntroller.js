// controllers/chatController.js
const axios = require("axios");
const PatientChat = require("../models/PatientChat");
const DoctorAIChat = require("../models/DoctorChat");
const Patient = require("../models/Patient");
const Doctor = require("../models/DoctorShema");
const FormData = require("form-data");

const chatWithVoice = async (req, res) => {
  try {
    const { patientId } = req.body;
    const audioFile = req.file;

    if (!patientId || !audioFile) {
      return res
        .status(400)
        .json({ message: "patientId and audio file are required" });
    }

    // verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const formData = new FormData();
    formData.append("audio", audioFile.buffer, {
      filename: audioFile.originalname || "voice-message.webm",
      contentType: audioFile.mimetype || "audio/webm", // <-- crucial
    });
    formData.append("patientId", patientId);

    // ✅ Post to FastAPI
    const flaskBase = process.env.CHATBOT_URL;
    const response = await axios.post(`${flaskBase}/chat/voice`, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "application/json",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { transcription, answer, lang_detected } = response.data;

    // Save transcription as patient message
    await PatientChat.create({
      patient: patient._id,
      role: "patient",
      message: `🎤 Voice: ${transcription}`,
    });

    // Save AI response
    await PatientChat.create({
      patient: patient._id,
      role: "ai",
      message: answer,
    });

    return res.status(200).json({
      transcription,
      answer,
      lang_detected,
      success: true,
    });
  } catch (error) {
    console.error(
      "Error processing voice chat:",
      error?.response?.data || error.message || error
    );
    return res.status(500).json({
      message: "Voice processing error",
      error: error?.response?.data || error?.message || String(error),
    });
  }
};

const chatWithFlaskAI = async (req, res) => {
  try {
    const { patientId, message } = req.body;

    if (!patientId || !message) {
      return res
        .status(400)
        .json({ message: "patientId and message are required" });
    }

    // verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // save patient message
    await PatientChat.create({
      patient: patient._id,
      role: "patient",
      message,
    });

    // send to Flask AI
    const flaskBase = process.env.CHATBOT_URL; // update if needed
    console.log(flaskBase)
    const flaskResponse = await axios.post(
      `${flaskBase}/assistance`,
      { text: message } // must match FastAPI schema
    );

    // accept either 'reply' (FastAPI) or 'answer' (older expectation)
    const data = flaskResponse.data || {};
    const aiMessage = data.reply || data.answer || "No response from AI.";
    const sources = data.sources || [];

    // save AI response
    await PatientChat.create({
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
    console.error(
      "Error communicating with Flask chatbot:",
      error?.message || error
    );
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
    await PatientChat.deleteMany({ patient: patient._id });

    return res
      .status(200)
      .json({ success: true, message: "All chats deleted for patient" });
  } catch (error) {
    console.error("Error deleting chats:", error?.message || error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error",
        error: error?.message || String(error),
      });
  }
};

const doctorChatWithAI = async (req, res) => {
  try {
    const { message, doctorId } = req.body;

    if (!message || !doctorId) {
      return res
        .status(400)
        .json({ message: "Message and doctorId are required" });
    }
    // Save doctor's message
    await DoctorAIChat.create({
      doctor: doctorId,
      role: "doctor",
      message,
    });
   
    // Get AI response from Flask server
    const flaskBase = process.env.CHATBOT_URL;
    const flaskResponse = await axios.post(
      `${flaskBase}/assistance`,
      { text: message } // must match FastAPI schema
    );
    const data = flaskResponse.data || {};
    const aiMessage = data.reply || data.answer || "No response from AI.";
    const sources = data.sources || [];
    // Save AI's response
    const aiResponse = await DoctorAIChat.create({
      doctor: doctorId,
      role: "ai",
      message:aiMessage,
      sources,
    });

    res.json(aiResponse);
  } catch (error) {
    console.error("Doctor AI chat error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getDoctorAIChats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const chats = await DoctorAIChat.find({ doctor: doctorId }).sort({
      createdAt: 1,
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDoctorAIChats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    await DoctorAIChat.deleteMany({ doctor: doctorId });
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  chatWithFlaskAI,
  deleteChatsForPatient,
  chatWithVoice,
  doctorChatWithAI,
  getDoctorAIChats,
  deleteDoctorAIChats,
};
