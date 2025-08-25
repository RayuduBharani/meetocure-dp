const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const PatientAuth = require("./routes/patientAuthRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoute");
const { verifyDoctor } = require("./routes/DoctorVerification");
const doctorVerifyRoutes = require("./routes/DoctorVerification");
const http = require('http');
const { Server } = require('socket.io');
const Notification = require('./models/Notification');
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins temporarily for testing
    methods: ["GET", "POST"],
    credentials: false,
    allowedHeaders: ["*"]
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io); // Make io accessible in routes

io.on('connection', (socket) => {
  // Join room for userId (frontend should emit 'join' with userId after login)
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  // Mark as read and delete notification
  socket.on('readNotification', async ({ notificationId, userId }) => {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    await Notification.findByIdAndDelete(notificationId);
    io.to(userId).emit('notificationDeleted', notificationId);
  });
});

// Auto-delete notifications after 2 days if not viewed
setInterval(async () => {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const oldNotifications = await Notification.find({ isRead: false, createdAt: { $lt: twoDaysAgo } });
  for (const notif of oldNotifications) {
    await Notification.findByIdAndDelete(notif._id);
    io.to(notif.userId.toString()).emit('notificationDeleted', notif._id.toString());
  }
}, 60 * 60 * 1000); // Run every hour


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

const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflicts
// Use server.listen instead of app.listen to enable Socket.IO
server.listen(PORT, () => console.log(`Server running on port ${PORT} with Socket.IO enabled`));