import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import toast from 'react-hot-toast';

const VideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoSearch, setVideoSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        try {

            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    q: videoSearch,
                    type: 'video',
                    key: 'AIzaSyAe6yoqI1mqp0vU8sn6NKZftYO0Y0c8N1c',
                },
            });
            setSearchResults(response.data.items);
        } catch (error) {
            toast.error('Error fetching video search results');
        }
    };

    const handleVideoSelect = (videoId) => {
        setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">Search for a Video</h2>
            <input
                type="text"
                placeholder="Search YouTube"
                className="input input-bordered w-full my-2"
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
                Search
            </button>

            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl">Search Results</h3>
                    <ul className="space-y-2">
                        {searchResults.map((result) => (
                            <li
                                key={result.id.videoId}
                                className="cursor-pointer"
                                onClick={() => handleVideoSelect(result.id.videoId)}
                            >
                                {result.snippet.title}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {videoUrl && (
                <div className="mt-4">
                    <h3 className="text-xl">Now Playing</h3>
                    <ReactPlayer url={videoUrl} playing controls />
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
