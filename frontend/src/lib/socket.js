import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : ''; // Production'da boş bırak - relative URL kullan

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
});