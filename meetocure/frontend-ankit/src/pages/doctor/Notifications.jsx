import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import NotificationItem from "../../components/NotificationItem";
import TopIcons from "../../components/TopIcons";
import { API_BASE_URL } from "../../lib/config";

const formatRelative = (isoStr) => {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } catch (_) {
    return "";
  }
};

const mapType = (type) => {
  if (type === "success") return "success";
  if (type === "warning") return "reschedule";
  if (type === "danger") return "cancel";
  return "reschedule"; // default neutral style
};

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const authToken = useMemo(
    () =>
      localStorage.getItem("token") ||
      localStorage.getItem("doctorToken") ||
      "",
    []
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setItems(res.data.notifications || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || e.message || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAll = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (e) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleClick = async (n) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/${n._id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
    } catch (_) {}

    const fallback = localStorage.getItem("doctorToken")
      ? "/doctor/appointments"
      : "/patient/calendar";
    navigate(n.targetPath || fallback);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
        <TopIcons />
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={markAll}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        </div>

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
                  title={n.title}
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

export default Notifications;
