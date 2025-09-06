// import React, { useEffect, useMemo, useState } from "react";
// import { FaArrowLeft } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import NotificationItem from "../../components/NotificationItem";
// import { API_BASE_URL } from "../../lib/config";
// import { socket, joinSocketRoom, onReceiveNotification, onNotificationDeleted } from "../../lib/socket";

// const formatRelative = (isoStr) => {
//     try {
//         const diffMs = Date.now() - new Date(isoStr).getTime();
//         const mins = Math.floor(diffMs / 60000);
//         if (mins < 60) return `${mins}m ago`;
//         const hrs = Math.floor(mins / 60);
//         if (hrs < 24) return `${hrs}h ago`;
//         const days = Math.floor(hrs / 24);
//         return days === 1 ? "1 day ago" : `${days} days ago`;
//     } catch (_) {
//         return "";
//     }
// };

// const mapType = (type) => {
//     if (type === "SUCCESS") return "success";
//     if (type === "TEST") return "reschedule";
//     if (type === "DOCTOR_REGISTRATION") return "success";
//     return "reschedule"; // default neutral style
// };

// const PatientNotifications = () => {
//     const navigate = useNavigate();
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const authToken = useMemo(() => {
//         const token = localStorage.getItem("token");
//         if (!token) {
//             console.log('No auth token found, redirecting to login...');
//             navigate('/login');
//             return "";
//         }
//         return token;
//     }, [navigate]);

//     const fetchNotifications = async () => {
//         try {
//             if (!authToken) {
//                 console.log('No auth token available, skipping fetch');
//                 return;
//             }

//             setLoading(true);
//             console.log('Fetching notifications with token:', authToken);
//             const res = await axios.get(`${API_BASE_URL}/api/notifications/my`, {
//                 headers: {
//                     'Authorization': `Bearer ${authToken}`,
//                     'Content-Type': 'application/json'
//                 },
//             });
//             console.log('Received notifications:', res.data);
//             setItems(res.data.notifications || []);
//         } catch (e) {
//             console.error('Error fetching notifications:', e);
//             if (e.response?.status === 401) {
//                 console.log('Authentication failed, redirecting to login...');
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('userId');
//                 navigate('/login');
//             } else {
//                 toast.error(
//                     e.response?.data?.message || e.message || "Failed to load notifications"
//                 );
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const markAll = async () => {
//         try {
//             await axios.put(
//                 `${API_BASE_URL}/api/notifications/read-all`,
//                 {},
//                 {
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setItems((prev) => prev.map((n) => ({ ...n, read: true })));
//             toast.success("All notifications marked as read");
//         } catch (e) {
//             toast.error("Failed to mark all as read");
//         }
//     };

//     const handleClick = async (n) => {
//         try {
//             await axios.put(
//                 `${API_BASE_URL}/api/notifications/${n._id}/read`,
//                 {},
//                 {
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setItems((prev) =>
//                 prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
//             );
//         } catch (_) { }

//         // Handle navigation based on notification type if needed
//         if (n.type === 'DOCTOR_REGISTRATION') {
//             navigate('/patient/find-doctors');
//         }
//     };

//     useEffect(() => {
//         console.log('PatientNotifications: Initializing...');

//         // Check authentication
//         if (!authToken) {
//             console.log('No auth token, skipping initialization');
//             return;
//         }

//         fetchNotifications();

//         // Join socket room with user ID
//         const userId = localStorage.getItem('userId');
//         console.log('PatientNotifications: User ID from localStorage:', userId);

//         if (userId && authToken) {
//             console.log('PatientNotifications: Joining socket room for user:', userId);
//             // Ensure socket is connected before joining room
//             if (socket.connected) {
//                 joinSocketRoom(userId);
//             } else {
//                 socket.connect();
//                 socket.once('connect', () => {
//                     joinSocketRoom(userId);
//                 });
//             }

//             // Listen for new notifications
//             onReceiveNotification((notification) => {
//                 console.log('PatientNotifications: Received new notification:', notification);
//                 setItems(prev => [notification, ...prev]);
//                 toast.success(notification.message || 'New notification received');
//             });

//             // Listen for deleted notifications
//             onNotificationDeleted((notificationId) => {
//                 console.log('PatientNotifications: Notification deleted:', notificationId);
//                 setItems(prev => prev.filter(item => item._id !== notificationId));
//             });

//             // Cleanup socket listeners
//             return () => {
//                 socket.off('receiveNotification');
//                 socket.off('notificationDeleted');
//                 socket.emit('leave', userId);
//             };
//         }
//     }, [authToken]);

//     return (
//         <div className="min-h-screen bg-[#F9FAFC] font-[Poppins] pb-24">
//             {/* Topbar */}
//             <div className="flex items-center justify-between px-6 py-5 border-b bg-white shadow-sm sticky top-0 z-30">
//                 <div className="flex items-center gap-3">
//                     <FaArrowLeft
//                         className="text-2xl text-[#1F2A37] cursor-pointer"
//                         onClick={() => navigate(-1)}
//                     />
//                     <h1 className="text-[22px] font-semibold text-[#1F2A37]">
//                         Notifications
//                     </h1>
//                 </div>
//             </div>

//             <div className="px-6 pt-6 space-y-6">
//                 <div className="flex justify-end">
//                     <button
//                         onClick={markAll}
//                         className="text-sm text-blue-600 hover:underline"
//                     >
//                         Mark all as read
//                     </button>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-sm p-4 divide-y">
//                     {loading ? (
//                         <div className="py-6 text-center text-gray-500">Loading...</div>
//                     ) : items.length === 0 ? (
//                         <div className="py-6 text-center text-gray-400">
//                             No notifications
//                         </div>
//                     ) : (
//                         items.map((n) => (
//                             <div
//                                 key={n._id}
//                                 className={n.read ? "opacity-70" : ""}
//                                 onClick={() => handleClick(n)}
//                             >
//                                 <NotificationItem
//                                     type={mapType(n.type)}
//                                     title={n.type === 'DOCTOR_REGISTRATION' ? 'New Doctor Available' : ''}
//                                     message={n.message}
//                                     time={formatRelative(n.createdAt)}
//                                 />
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PatientNotifications;










import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import NotificationItem from "../../components/NotificationItem";
import { API_BASE_URL } from "../../lib/config";
import { getSocket, joinSocketRoom } from "../../lib/socket"; // ✅ simplified socket helpers

// --- Utility functions ---
const formatRelative = (isoStr) => {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return "";
  }
};

const mapType = (type) => {
  if (type === "SUCCESS") return "success";
  if (type === "TEST") return "reschedule";
  if (type === "DOCTOR_REGISTRATION") return "success";
  return "reschedule"; // default neutral style
};

// --- Component ---
const PatientNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const authToken = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No auth token found, redirecting to login...");
      navigate("/login");
      return "";
    }
    return token;
  }, [navigate]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      if (!authToken) return;

      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
        withCredentials: true,
      });
      setItems(res.data.notifications || []);
    } catch (e) {
      console.error("Error fetching notifications:", e);
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        toast.error(
          e.response?.data?.message || e.message || "Failed to load notifications"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const markAll = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      // Delete all read notifications
      await axios.delete(`${API_BASE_URL}/api/notifications/delete-read`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Always refetch notifications from backend to ensure UI matches DB
      await fetchNotifications();
      toast.success("All read notifications deleted");
    } catch {
      toast.error("Failed to mark all as read and delete");
    }
  };

  // Handle single click notification
  const handleClick = async (n) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/${n._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
      );
    } catch (_) { }

    if (n.type === "DOCTOR_REGISTRATION") {
      navigate("/patient/find-doctors");
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (!authToken) return;

    fetchNotifications();

    const userId = localStorage.getItem("userId");
    const socket = getSocket();

    if (socket && userId) {
      if (socket.connected) {
        joinSocketRoom(userId);
      } else {
        socket.connect();
        socket.once("connect", () => joinSocketRoom(userId));
      }

      // Listen for real-time updates
      socket.on("receiveNotification", (notification) => {
        setItems((prev) => [notification, ...prev]);
        toast.success(notification.message || "New notification received");
      });

      socket.on("notificationDeleted", (notificationId) => {
        setItems((prev) => prev.filter((item) => item._id !== notificationId));
      });

      return () => {
        socket.off("receiveNotification");
        socket.off("notificationDeleted");
        socket.emit("leave", userId);
      };
    }
  }, [authToken]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#F9FAFC] font-[Poppins] pb-24">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-5 border-b bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <FaArrowLeft
            className="text-2xl text-[#1F2A37] cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-[22px] font-semibold text-[#1F2A37]">
            Notifications
          </h1>
        </div>
        <button
          onClick={markAll}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 divide-y">
          {loading ? (
            <div className="py-6 text-center text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              No notifications
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n._id}
                className={n.read ? "opacity-70" : ""}
                onClick={() => handleClick(n)}
              >
                <NotificationItem
                  type={mapType(n.type)}
                  title={
                    n.type === "DOCTOR_REGISTRATION"
                      ? "New Doctor Available"
                      : ""
                  }
                  message={n.message}
                  time={formatRelative(n.createdAt)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientNotifications;
