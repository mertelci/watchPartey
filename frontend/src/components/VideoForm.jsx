import { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { socket } from '../lib/socket';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VideoForm = ({ onVideoAdded }) => {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { roomId } = useParams();
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const videoId = extractVideoId(input);
        if (videoId) {
            await addVideo(videoId);
        } else {
            // Search functionality
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
        }
    };

    const addVideo = async (videoId) => {
        try {
            await axiosInstance.post(`/rooms/${roomId}/video`, { videoId });
            socket.emit('video-added', { roomId, videoId });
            onVideoAdded(videoId);
            setInput('');
            setSearchResults([]);
        } catch (error) {
            toast.error("Error adding video");
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="flex items-center p-2 gap-2">
                <input
                    type="text"
                    placeholder="Paste YouTube URL or search videos..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 
                             border-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                    type="submit"
                    disabled={isSearching || !input.trim()}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSearching ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Searching...
                        </span>
                    ) : (
                        extractVideoId(input) ? 'Add' : 'Search'
                    )}
                </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto border-t border-white/10">
                    {searchResults.map((video) => (
                        <div
                            key={video.id.videoId}
                            onClick={() => addVideo(video.id.videoId)}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer 
                                     transition-colors border-b border-white/5"
                        >
                            <img
                                src={video.snippet.thumbnails.default.url}
                                alt={video.snippet.title}
                                className="w-24 h-auto rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {video.snippet.title}
                                </p>
                                <p className="text-gray-400 text-xs truncate">
                                    {video.snippet.channelTitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VideoForm;
