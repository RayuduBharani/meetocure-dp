const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const PatientAuth = require("./routes/patientAuthRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoute");
const { verifyDoctor } = require("./routes/DoctorVerification");
const doctorVerifyRoutes = require("./routes/DoctorVerification");
dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  "http://localhost:5174",
  "http://localhost:3000",
  "https://meet-o-cure.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.filter(Boolean).includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
// Patient authentication route
app.use("/api/auth/patient", PatientAuth);
// Doctor authentication route
app.use("/api/auth/doctor", doctorAuthRoutes);
// Doctor verification form route
app.use("/api/doctor", doctorVerifyRoutes);

app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
// Enable when chat endpoint is ready
// app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/doc&hosp", require("./routes/doc&hospRoutes"));
app.use("/api/patient", require("./routes/patientRoutes"));

app.get("/", (req, res) => {
  res.send("API is Working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
