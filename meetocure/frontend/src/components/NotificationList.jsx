import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket, joinSocketRoom, onReceiveNotification, onNotificationDeleted, readNotification } from '../lib/socket';

const NotificationsList = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    joinSocketRoom(userId);
    fetchNotifications();

    onReceiveNotification((notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    onNotificationDeleted((id) => {
      setNotifications(prev => prev.filter(n => n._id !== id));
    });

    return () => {
      socket.off('receiveNotification');
      socket.off('notificationDeleted');
    };
    // eslint-disable-next-line
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || []);
    } catch (e) {
      setNotifications([]);
    }
  };

  const handleClick = async (id) => {
    readNotification(id, userId); // marks as read and deletes
  };

  return (
    <div>
      <h3>Notifications</h3>
      <ul>
        {notifications.map(n => (
          <li key={n._id} onClick={() => handleClick(n._id)} style={{ cursor: 'pointer' }}>
            {n.message} <span>({new Date(n.createdAt).toLocaleString()})</span>
          </li>
        ))}
        {notifications.length === 0 && <li>No notifications</li>}
      </ul>
    </div>
  );
};

export default NotificationsList;