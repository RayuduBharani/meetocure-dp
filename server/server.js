const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const PatientAuth = require("./routes/patientAuthRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoute");
const doctorVerifyRoutes = require("./routes/DoctorVerification");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://meet-o-cure.vercel.app",
];

const app = express();

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
app.use("/api/auth/patient", PatientAuth); 
app.use("/api/auth/doctor", doctorAuthRoutes);
app.use("/api/doctor", doctorVerifyRoutes);
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/doc&hosp", require("./routes/doc&hospRoutes"));
app.use("/api/patient/profile", require("./routes/patientProfileRoutes"));

app.get("/", (req, res) => {
  res.send("API is Working");
});

// --- Socket.IO Setup ---
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins.filter(Boolean),
//     credentials: true,
//   },
//   path: "/socket.io",
// });

// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);

//   socket.on("join", (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined room`);
//   });

//   socket.on("leave", (userId) => {
//     socket.leave(userId);
//     console.log(`User ${userId} left room`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Socket disconnected:", socket.id);
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));