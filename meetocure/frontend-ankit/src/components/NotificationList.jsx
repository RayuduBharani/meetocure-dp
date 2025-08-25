import React, { useEffect, useState } from 'react';
import { getNotifications, deleteNotification } from '../lib/api';
import { socket, joinSocketRoom, onReceiveNotification, onNotificationDeleted, readNotification } from '../lib/socket';

const NotificationsList = ({ userId }) => {
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
    const data = await getNotifications(userId);
    setNotifications(data);
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