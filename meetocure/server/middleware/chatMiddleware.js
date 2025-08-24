const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS only for your frontend domain
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, "http://localhost:5173", "http://localhost:3000"].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

// Proxy POST /api/chat to your Flask backend's /chat
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Use env-configurable Flask backend URL
    const flaskBackendUrl = `${process.env.CHATBOT_BASE_URL || "https://chatbot-de6r.onrender.com"}/chat`;

    const response = await axios.post(flaskBackendUrl, {
      message: userMessage,
    });

    // Forward response as-is (adjust if needed)
    res.json({
      answer: response.data.answer,
      success: response.data.success,
      sources: response.data.sources || [],
    });
  } catch (error) {
    console.error("Error forwarding to Flask backend:", error.message);
    res.status(500).json({
      answer: "Error contacting AI server.",
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
