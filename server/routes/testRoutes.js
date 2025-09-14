// this is for testing purpose




// const express = require('express');
// const router = express.Router();

// // Test notification endpoint for patient
// router.post('/patient-notification', (req, res) => {
//     try {
//         const io = req.app.get('io');
//         if (!io) {
//             throw new Error('Socket.IO instance not found');
//         }

//         const { userId } = req.body;
//         if (!userId) {
//             throw new Error('User ID is required');
//         }

//         const testNotification = {
//             _id: Date.now().toString(),
//             message: "🎉 Great news! Dr. Sarah Smith, a top-rated Cardiologist, has just joined MeetoCure. Book your consultation now!",
//             type: "DOCTOR_REGISTRATION",
//             userId: userId,
//             metadata: {
//                 doctorId: "sample_doctor_id",
//                 specialty: "Cardiologist",
//                 doctorName: "Dr. Sarah Smith"
//             },
//             createdAt: new Date(),
//             isRead: false
//         };

//         // Send to specific user's room
//         io.to(userId).emit('newNotification', { notification: testNotification });

//         // Also broadcast to ensure delivery
//         io.emit('newNotification', { notification: testNotification });

//         // Log for debugging
//         console.log('Test notification details:', {
//             userId,
//             notificationId: testNotification._id,
//             type: testNotification.type,
//             message: testNotification.message,
//             socketRooms: io.sockets.adapter.rooms
//         }); res.json({
//             success: true,
//             message: "Test notification sent",
//             notification: testNotification
//         });
//     } catch (error) {
//         console.error('Error sending test notification:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

// // General test notification endpoint
// router.post('/notification', (req, res) => {
//     try {
//         const io = req.app.get('io');
//         if (!io) {
//             throw new Error('Socket.IO instance not found');
//         }

//         const testNotification = {
//             message: "This is a test notification from the server",
//             type: "TEST",
//             metadata: {
//                 testId: Date.now(),
//                 testType: "server-test"
//             },
//             createdAt: new Date()
//         };

//         // Broadcast to all connected clients
//         io.emit('newNotification', { notification: testNotification });

//         // Log for debugging
//         console.log('Test notification sent:', testNotification);

//         res.json({
//             success: true,
//             message: "Test notification sent",
//             notification: testNotification
//         });
//     } catch (error) {
//         console.error('Error sending test notification:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

// module.exports = router;
