import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001'; // Updated to match new backend port

export const socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'], // Try polling first
    withCredentials: false, // Match server configuration
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    path: '/socket.io'
});

socket.on('connect', () => {
    console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    // Attempt to reconnect with polling if WebSocket fails
    if (socket.io.opts.transports.includes('websocket')) {
        console.log('Falling back to polling transport');
        socket.io.opts.transports = ['polling'];
    }
});

socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
});

socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
        // If the server disconnected us, try to reconnect
        socket.connect();
    }
});

export const joinSocketRoom = (userId) => {
    if (socket.connected) {
        socket.emit('join', userId);
    } else {
        console.warn('Socket not connected. Will attempt to join room after connection');
        socket.on('connect', () => {
            socket.emit('join', userId);
        });
    }
};

export const onReceiveNotification = (callback) => {
    socket.on('receiveNotification', callback);
};

export const onNotificationDeleted = (callback) => {
    socket.on('notificationDeleted', callback);
};

export const readNotification = (notificationId, userId) => {
    socket.emit('readNotification', { notificationId, userId });
};