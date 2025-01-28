import express, { json } from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';
import roomRoutes from './routes/room.routes.js';
import Room from './models/Room.js';
import path from "path";

dotenv.config();

const __dirname = path.resolve();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});


const queues = {};


const roomStates = new Map();


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (roomId, username) => {
        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;

        updateActiveUsers(roomId);

        try {
            const room = await Room.findById(roomId)
                .populate('createdBy', 'username')
                .populate('invitedUsers', 'username');


            io.to(roomId).emit('room-data', room);


            const activeUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                .map(socketId => {
                    const s = io.sockets.sockets.get(socketId);
                    return s.username;
                })
                .filter(Boolean);

            io.to(roomId).emit('update-users', { users: activeUsers });
        } catch (error) {
            console.error("Error fetching room data:", error);
        }

        socket.to(roomId).emit('request-video-state');
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        socket.roomId = null;
        updateActiveUsers(roomId);
    });

    socket.on('provide-video-state', ({ roomId, videoState }) => {

        socket.to(roomId).emit('receive-video-state', videoState);
    });

    socket.on('video-sync', ({ roomId, state }) => {
        const roomState = roomStates.get(roomId);
        if (!roomState) return;


        const timeDiff = Date.now() - state.timestamp;
        const adjustedTime = state.currentTime + (timeDiff / 1000);


        if (Math.abs(adjustedTime - roomState.currentTime) > 2) {
            socket.emit('force-sync', {
                currentTime: roomState.currentTime,
                isPlaying: roomState.action === 'play',
                timestamp: Date.now()
            });
        }
    });

    socket.on('video-added', ({ roomId, videoId }) => {
        io.to(roomId).emit('new-video', { videoId });
    });

    socket.on('send-message', ({ roomId, message }) => {
        if (!socket.username) return;

        const messageData = {
            message,
            username: socket.username,
            createdAt: new Date()
        };

        io.to(roomId).emit('new-message', messageData);
    });

    socket.on('video-state-change', ({ roomId, action, currentTime, timestamp }) => {
        try {
            const state = {
                action,
                currentTime,
                timestamp: timestamp || Date.now(),
                sourceId: socket.id
            };


            roomStates.set(roomId, state);

            socket.to(roomId).emit('video-update', state);
        } catch (error) {
            console.error("Error in video-state-change:", error);
        }
    });


    socket.on('request-sync', ({ roomId }) => {
        try {
            const state = roomStates.get(roomId);
            if (state) {
                socket.emit('force-sync', {
                    ...state,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error("Error in request-sync:", error);
        }
    });

    socket.on('video-seek', ({ roomId, currentTime, timestamp }) => {
        const seekState = {
            currentTime,
            timestamp,
            sourceSocketId: socket.id
        };

        roomStates.set(roomId, {
            ...roomStates.get(roomId),
            ...seekState
        });

        socket.to(roomId).emit('force-seek', seekState);
    });

    socket.on('video-state-change', ({ roomId, action, currentTime }) => {

        socket.to(roomId).emit('video-update', {
            action,
            currentTime,
            sourceId: socket.id
        });
    });

    socket.on('video-seek', ({ roomId, currentTime }) => {

        socket.to(roomId).emit('video-seek-update', {
            currentTime,
            sourceId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.roomId) {
            updateActiveUsers(socket.roomId);
        }
    });


    const updateActiveUsers = (roomId) => {
        const roomSockets = io.sockets.adapter.rooms.get(roomId);
        const activeUsers = roomSockets ? Array.from(roomSockets).map(socketId => {
            const userSocket = io.sockets.sockets.get(socketId);
            return userSocket?.username;
        }).filter(Boolean) : [];

        io.to(roomId).emit('update-users', { users: activeUsers });
    }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/rooms", roomRoutes);


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(_dirname, "../frontend", "dist", "index.html"));
    });
}


// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB bağlantısı başarılı.');
    } catch (error) {
        console.error('MongoDB bağlantı hatası:', error.message);
        process.exit(1);
    }
};


const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
    connectDB();
});
