// controllers/room.controller.js

import Room from '../models/Room.js';
import User from '../models/User.js';

const rooms = {}; // Hafızada odaları tutmak için geçici bir obje (DB kullanılmıyor)

export const createRoom = async (req, res) => {
    try {
        const { roomName, invitedUsers } = req.body;
        const userId = req.user._id;

        // Input validation
        if (!roomName) {
            return res.status(400).json({ message: "Room name is required" });
        }

        // Username'lerden User ID'leri bul
        let invitedUserIds = [];
        if (invitedUsers && Array.isArray(invitedUsers)) {
            const users = await User.find({
                username: { $in: invitedUsers }
            });
            
            invitedUserIds = users.map(user => user._id);

            // Bulunamayan kullanıcıları kontrol et
            const foundUsernames = users.map(user => user.username);
            const notFoundUsers = invitedUsers.filter(username => !foundUsernames.includes(username));
            
            if (notFoundUsers.length > 0) {
                return res.status(400).json({ 
                    message: `Following users not found: ${notFoundUsers.join(', ')}` 
                });
            }
        }

        const newRoom = new Room({
            roomName,
            invitedUsers: invitedUserIds,
            createdBy: userId
        });

        await newRoom.save();

        // Populate room with user details
        const populatedRoom = await Room.findById(newRoom._id)
            .populate('createdBy', 'username')
            .populate('invitedUsers', 'username');

        res.status(201).json({
            room: populatedRoom,
            message: "Room created successfully!"
        });

    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        console.log("Attempting to join room:", { roomId, userId });

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isInvited = (room.invitedUsers || []).some(user =>
            user && user.toString() === userId.toString()
        ) || (room.createdBy && room.createdBy.toString() === userId.toString());

        if (!isInvited) {
            return res.status(403).json({ message: "You are not invited to this room" });
        }

        res.status(200).json({ message: "Welcome to the room!", room });
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        const rooms = await Room.find({
            $or: [
                { createdBy: userId },
                { invitedUsers: userId }
            ]
        }).populate('createdBy', 'username');

        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addVideoToRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { videoId } = req.body;
        const userId = req.user._id;

        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required" });
        }

        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Update room with new video
        room.video = videoId;
        await room.save();

        res.status(200).json({ 
            message: "Video added successfully", 
            videoId,
            room 
        });

    } catch (error) {
        console.error("Error adding video:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRoomData = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId)
            .populate('createdBy', 'username')
            .populate('invitedUsers', 'username');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error("Error fetching room data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};