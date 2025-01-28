import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';
import axios from 'axios';
import toast from 'react-hot-toast';

const VideoQueue = ({ roomId, onVideoSelect }) => {
    const [queue, setQueue] = useState([]);
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const YOUTUBE_API_KEY = 'AIzaSyAe6yoqI1mqp0vU8sn6NKZftYO0Y0c8N1c';

    useEffect(() => {
        socket.on('queue-updated', (updatedQueue) => {
            setQueue(updatedQueue || []);
        });

        socket.on('new-video', ({ videoId }) => {
            onVideoSelect(videoId);
        });

        return () => {
            socket.off('queue-updated');
            socket.off('new-video');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    maxResults: 5,
                    q: input,
                    type: 'video',
                    key: YOUTUBE_API_KEY
                }
            });
            setSearchResults(response.data.items);
        } catch (error) {
            toast.error('Error searching videos');
        } finally {
            setIsSearching(false);
        }
    };

    const addToQueue = (video) => {
        const queueVideo = {
            videoId: video.id.videoId,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url
        };

        socket.emit('add-to-queue', {
            roomId,
            video: queueVideo
        });

        setInput('');
        setSearchResults([]);
    };

    const removeFromQueue = (index) => {
        socket.emit('remove-from-queue', { roomId, index });
    };

    const playFromQueue = (videoId) => {
        socket.emit('play-from-queue', { roomId, videoId });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search Section */}
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Queue</h3>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white 
                                 placeholder-gray-400 border-none focus:outline-none 
                                 focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !input.trim()}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg 
                                 hover:bg-teal-600 disabled:opacity-50"
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Queue List - Made Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="border-b border-white/10">
                        {searchResults.map((video) => (
                            <div
                                key={video.id.videoId}
                                onClick={() => addToQueue(video)}
                                className="flex items-center gap-3 p-2 hover:bg-white/5 
                                         cursor-pointer transition-colors"
                            >
                                <img
                                    src={video.snippet.thumbnails.default.url}
                                    alt={video.snippet.title}
                                    className="w-20 h-auto rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {video.snippet.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Queue Items */}
                <div className="p-2 space-y-2">
                    {queue && queue.map((video, index) => (
                        video && video.thumbnail && (  // Add null check here
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-white/5 p-2 rounded-lg 
                                         hover:bg-white/10 transition-colors"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title || 'Video thumbnail'}
                                    className="w-20 h-auto rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {video.title || 'Untitled'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onVideoSelect(video.videoId)}
                                    className="px-2 py-1 bg-teal-500 text-white rounded"
                                >
                                    Play
                                </button>
                                <button
                                    onClick={() => removeFromQueue(index)}
                                    className="px-2 py-1 text-red-400"
                                >
                                    Remove
                                </button>
                            </div>
                        )
                    ))}
                    {(!queue || queue.length === 0) && (
                        <p className="text-gray-400 text-sm text-center py-4">
                            Queue is empty
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoQueue;