import { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RoomCreateForm = () => {
    const [roomData, setRoomData] = useState({
        roomName: '',
        invitedUsers: []
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/rooms/create', {
                roomName: roomData.roomName,
                invitedUsers: roomData.invitedUsers.length > 0 ? roomData.invitedUsers : []
            });

            toast.success('Room created successfully!');
            navigate(`/room/${res.data.room._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating room');
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Room</h2>
                <p className="text-gray-300 text-sm">Create a room and invite your friends to watch together</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Room Name</label>
                    <input
                        type="text"
                        placeholder="Enter a room name..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                                 text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-teal-500 focus:border-transparent"
                        value={roomData.roomName}
                        onChange={(e) => setRoomData({ ...roomData, roomName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Invite Users</label>
                    <input
                        type="text"
                        placeholder="Enter usernames (comma separated)..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                                 text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-teal-500 focus:border-transparent"
                        onChange={(e) => setRoomData({
                            ...roomData,
                            invitedUsers: e.target.value.split(',').map(user => user.trim()).filter(Boolean)
                        })}
                    />
                    <p className="text-xs text-gray-400">Separate usernames with commas</p>
                </div>

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                             transition-colors duration-200 focus:outline-none focus:ring-2 
                             focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    Create Room
                </button>
            </form>
        </div>
    );
};

export default RoomCreateForm;