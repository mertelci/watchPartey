import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const VideoControls = ({
    isPlaying,
    onPlayPause,
    onSeek,
    duration,
    currentTime,
    volume,
    onVolumeChange,
    disabled
}) => {
    const [localProgress, setLocalProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Prevent progress updates while dragging
    useEffect(() => {
        if (!isDragging && duration) {
            setLocalProgress((currentTime / duration) * 100);
        }
    }, [currentTime, duration, isDragging]);

    const handleProgressClick = (e) => {
        if (disabled) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const percentage = x / bounds.width;
        const newTime = duration * percentage;
        onSeek(newTime);
    };

    const handleProgressDragStart = () => {
        setIsDragging(true);
    };

    const handleProgressDragEnd = (e) => {
        setIsDragging(false);
        handleProgressClick(e);
    };

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        return `${mm}:${ss}`;
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 w-full z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div
                className="w-full h-2 bg-gray-600 rounded cursor-pointer"
                onClick={handleProgressClick}
                onMouseDown={handleProgressDragStart}
                onMouseUp={handleProgressDragEnd}
                onMouseLeave={() => setIsDragging(false)}
            >
                <div
                    className="h-full bg-teal-500 rounded transition-all"
                    style={{ width: `${localProgress}%` }}
                />
            </div>
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onSeek(currentTime - 10)}
                        disabled={disabled}
                        className="p-2 rounded-full hover:bg-white/10"
                    >
                        <SkipBack className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={onPlayPause}
                        disabled={disabled}
                        className="p-3 rounded-full bg-white/20 hover:bg-white/30"
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-white" />
                        ) : (
                            <Play className="w-8 h-8 text-white" />
                        )}
                    </button>

                    <button
                        onClick={() => onSeek(currentTime + 10)}
                        disabled={disabled}
                        className="p-2 rounded-full hover:bg-white/10"
                    >
                        <SkipForward className="w-6 h-6 text-white" />
                    </button>
                </div>


            </div>
        </div>
    );
};

export default VideoControls;