import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axiosInstance.get('/rooms');
            setRooms(response.data);
        } catch (error) {
            toast.error('Error fetching rooms');
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async (roomId) => {
        try {
            await axiosInstance.get(`/rooms/${roomId}/join`);
            toast.success('Joined room successfully!');
            // Navigate to room page
            navigate(`/room/${roomId}`);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Error joining room');
        }
    };

    if (loading) {
        return <div className="text-center">Loading rooms...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
                <div className="text-sm text-gray-300">
                    {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {rooms.map(room => (
                    <div
                        key={room._id}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition-all 
                                 duration-200 hover:bg-white/20 cursor-pointer"
                        onClick={() => joinRoom(room._id)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {room.roomName}
                                </h3>
                                <div className="flex items-center space-x-2 text-gray-300">
                                    <span className="text-sm">Created by</span>
                                    <span className="px-2 py-1 bg-white/10 rounded-full text-sm">
                                        {room.createdBy.username}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                                         transition-colors duration-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    joinRoom(room._id);
                                }}
                            >
                                Join Room
                            </button>
                        </div>
                    </div>
                ))}

                {rooms.length === 0 && (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl">
                        <p className="text-gray-300 font-bold">No rooms available</p>
                        <p className="text-sm text-gray-400 mt-2">Create a room to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomList;