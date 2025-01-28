import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true
    },
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Kullanıcı modeline referans veriyoruz
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Room = mongoose.model('Room', RoomSchema);
export default Room;