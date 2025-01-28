import express from "express";
import { createRoom, getRooms } from "../controllers/room.controller.js";
import { protectRoute } from "../middleware/auth.js";
import { joinRoom } from "../controllers/room.controller.js";
import Room from "../models/Room.js";
import { addVideoToRoom } from "../controllers/room.controller.js";

const router = express.Router();

// Oda oluşturma endpoint'i
router.post("/create", protectRoute, createRoom);
router.get("/:roomId/join", protectRoute, joinRoom);
router.get("/", protectRoute, getRooms);

router.get("/:roomId", protectRoute, async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate('createdBy', 'username').populate('invitedUsers', 'username');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error("Error fetching room data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/:roomId/video", protectRoute, addVideoToRoom);

export default router;
