import React, { useState } from 'react';
import { sendNotification } from '../lib/api';

const SendNotification = ({ userId }) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message) return;
    await sendNotification(message, userId);
    setMessage('');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Notification message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send Notification</button>
    </div>
  );
};

export default SendNotification;