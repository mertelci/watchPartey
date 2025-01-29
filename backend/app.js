import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.routes.js';
import { setupRoomSockets } from './sockets/room.sockets.js';
import { applyMiddlewares } from './middleware/index.js';
import { setupProduction } from './config/production.js';
dotenv.config();


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

applyMiddlewares(app);

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/rooms", roomRoutes);

setupProduction(app);
setupRoomSockets(io);

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
