import axios from 'axios';

const API_URL = '${process.env.VITE_BACKEND_URL}/api/notifications';

export const getNotifications = async (userId) => {
  const res = await axios.get(`${API_URL}/${userId}`);
  return res.data;
};

export const sendNotification = async (message, userId) => {
  const res = await axios.post(API_URL, { message, userId });
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};