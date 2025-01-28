import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../lib/socket';
import ReactPlayer from 'react-player';
import VideoForm from '../components/VideoForm';
import { useAuthStore } from '../store/authStore';
import ChatBox from '../components/ChatBox';
import VideoControls from '../components/VideoControls';

const RoomPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [videoUrl, setVideoUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const lastUpdateTime = useRef(Date.now());
    const syncThreshold = 2; // 2 saniye threshold
    const [isSeeking, setIsSeeking] = useState(false);
    const [room, setRoom] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const { authUser } = useAuthStore();
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isProcessingStateChange, setIsProcessingStateChange] = useState(false);

    // Video player konfigürasyonu güncelleme
    const videoConfig = {
        // Daha sık senkronizasyon kontrolü
        syncCheckInterval: 1000,
        // İzin verilen maksimum senkronizasyon farkı (ms)
        maxDrift: 1000,
        // Yeni bir kullanıcı katıldığında bekleme süresi
        joinDelay: 500
    };

    useEffect(() => {
        if (roomId && authUser?.username) {
            socket.emit('join-room', roomId, authUser.username);
        }

        // Listen for video state requests when new user joins
        socket.on('request-video-state', () => {
            if (playerRef.current && videoUrl) {
                socket.emit('provide-video-state', {
                    roomId,
                    videoState: {
                        videoUrl,
                        currentTime: playerRef.current.getCurrentTime(),
                        isPlaying,
                    }
                });
            }
        });

        // Receive video state as new user
        socket.on('receive-video-state', (videoState) => {
            if (videoState.videoUrl) {
                setVideoUrl(videoState.videoUrl);
                setIsPlaying(videoState.isPlaying);
                // Wait for player to be ready before seeking
                setTimeout(() => {
                    if (playerRef.current) {
                        playerRef.current.seekTo(videoState.currentTime);
                    }
                }, 1000);
            }
        });

        socket.on('video-update', (state) => {
            if (!isSeeking && playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                const timeDiff = Math.abs(currentTime - state.currentTime);

                // Sadece önemli zaman farklarında senkronize et
                if (timeDiff > syncThreshold) {
                    playerRef.current.seekTo(state.currentTime);
                }
                setIsPlaying(state.isPlaying);
            }
        });

        socket.on('new-video', ({ videoId }) => {
            setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
            setIsPlaying(true);
        });

        socket.on('room-data', (roomData) => {
            setRoom(roomData);
        });

        socket.on('update-users', ({ users }) => {
            setActiveUsers(users);
        });

        socket.on('play-next-video', (video) => {
            handleVideoAdded(video.videoId);
        });

        return () => {
            socket.off('request-video-state');
            socket.off('receive-video-state');
            socket.off('video-update');
            socket.off('new-video');
            socket.off('room-data');
            socket.off('update-users');
            socket.off('play-next-video');
            if (roomId) {
                socket.emit('leave-room', roomId);
            }
        };
    }, [roomId, videoUrl, isPlaying, authUser]);

    useEffect(() => {
        // Listen for video state updates from other clients
        socket.on('video-update', ({ action, currentTime, sourceId }) => {
            if (sourceId !== socket.id) {
                setIsProcessingStateChange(true);
                setIsPlaying(action === 'play');
                if (playerRef.current) {
                    playerRef.current.seekTo(currentTime);
                }
                setTimeout(() => setIsProcessingStateChange(false), 500);
            }
        });

        socket.on('video-seek-update', ({ currentTime, sourceId }) => {
            if (sourceId !== socket.id) {
                setIsProcessingStateChange(true);
                if (playerRef.current) {
                    playerRef.current.seekTo(currentTime);
                }
                setTimeout(() => setIsProcessingStateChange(false), 500);
            }
        });

        return () => {
            socket.off('video-update');
            socket.off('video-seek-update');
        };
    }, []);

    const emitVideoState = (isPlaying, currentTime) => {
        const now = Date.now();
        // Çok sık güncelleme göndermeyi engelle
        if (now - lastUpdateTime.current > 1000) {
            socket.emit('video-sync', {
                roomId,
                state: {
                    isPlaying,
                    currentTime
                }
            });
            lastUpdateTime.current = now;
        }
    };

    const handleVideoAdded = (videoId) => {
        setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
        setIsPlaying(true);
        socket.emit('video-added', { roomId, videoId });
    };

    const handleLeaveRoom = () => {
        socket.emit('leave-room', roomId);
        navigate('/');
    };

    // Video kontrol fonksiyonlarını güncelle
    const handleVideoControls = {
        onPlayPause: () => {
            if (!isProcessingStateChange) {
                try {
                    const newState = !isPlaying;
                    setIsPlaying(newState);
                    const currentTime = playerRef.current?.getCurrentTime() || 0;

                    // State değişikliğini diğer kullanıcılara bildir
                    socket.emit('video-state-change', {
                        roomId,
                        action: newState ? 'play' : 'pause',
                        currentTime,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error("Video control error:", error);
                    // Hata durumunda state'i resetle
                    setIsProcessingStateChange(false);
                }
            }
        },
        onSeek: (time) => {
            if (!isProcessingStateChange) {
                playerRef.current.seekTo(time);
                socket.emit('video-seek', {
                    roomId,
                    currentTime: time
                });
            }
        }
    };

    // Socket event listener'ları güncelle
    useEffect(() => {
        socket.on('video-update', ({ action, currentTime, timestamp, sourceId }) => {
            if (sourceId !== socket.id) {
                setIsProcessingStateChange(true);

                // Zaman farkını hesapla
                const timeDiff = (Date.now() - timestamp) / 1000;
                const adjustedTime = currentTime + timeDiff;

                // State'i güncelle
                setIsPlaying(action === 'play');

                if (playerRef.current) {
                    // Video pozisyonunu senkronize et
                    playerRef.current.seekTo(adjustedTime);
                }

                // İşlem tamamlandığında state'i resetle
                setTimeout(() => setIsProcessingStateChange(false), 500);
            }
        });

        // Cleanup
        return () => {
            socket.off('video-update');
        };
    }, []);

    return (
        <div className="min-h-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-gray-900 via-teal-900 to-black">
            {/* Modern Glassmorphism Header */}
            <header className="bg-black/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex items-center space-x-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                                WatchPartey
                            </h1>
                            {room && (
                                <div className="flex items-center space-x-5">
                                    <span className="px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-sm border border-white/20">
                                        {room.roomName}
                                    </span>
                                </div>
                            )}
                            {room && (
                                <div className="text-center text-white/60 text-xs">
                                    Created by <span className="text-teal-400">{room.createdBy?.username}</span>
                                </div>
                            )}
                        </div>



                        {/* Right Section */}
                        <div className="flex items-center justify-end space-x-4">
                            {/* Active Users */}
                            <div className="flex space-x-1">
                                {activeUsers.map((username, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center px-3 py-1.5 bg-white/10 rounded-full border border-white/20"
                                    >
                                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></div>
                                        <span className="text-sm text-white/80 font-semibold">{username}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleLeaveRoom}
                                className="px-4 py-1.5 bg-red-500/10 text-white text-sm rounded-lg hover:bg-red-900
                                         transition-all duration-200 border border-red-500/20 font-semibold"
                            >
                                Leave Room
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Video Section */}
                    <div className="col-span-12 lg:col-span-9 space-y-6">
                        {/* Video Player */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                {videoUrl ? (
                                    <div className="absolute inset-0">
                                        {/* Tıklamaları engellemek için overlay */}
                                        <div
                                            className="absolute inset-0 z-10"
                                            style={{ pointerEvents: 'auto' }}
                                            onClick={(e) => e.preventDefault()}
                                        />

                                        <ReactPlayer
                                            ref={playerRef}
                                            url={videoUrl}
                                            width="100%"
                                            height="100%"
                                            playing={isPlaying}
                                            volume={volume}
                                            controls={false}
                                            playsinline={true}
                                            config={{
                                                youtube: {
                                                    playerVars: {
                                                        showinfo: 1,
                                                        origin: window.location.origin,
                                                        disablekb: 1,
                                                        modestbranding: 1,
                                                        controls: 0,
                                                        iv_load_policy: 3,
                                                        rel: 0
                                                    }
                                                }
                                            }}
                                            style={{
                                                pointerEvents: 'none',
                                                userSelect: 'none'
                                            }}
                                            onProgress={({ playedSeconds, loaded }) => {
                                                if (!isSeeking && isPlaying) {
                                                    const now = Date.now();
                                                    if (now - lastUpdateTime.current > 1000) {
                                                        socket.emit('video-sync', {
                                                            roomId,
                                                            state: {
                                                                isPlaying,
                                                                currentTime: playedSeconds,
                                                                timestamp: now
                                                            }
                                                        });
                                                        lastUpdateTime.current = now;
                                                    }
                                                }
                                            }}
                                            onDuration={(duration) => setDuration(duration)}
                                            onBuffer={() => setIsBuffering(true)}
                                            onBufferEnd={() => setIsBuffering(false)}
                                            onEnded={() => {
                                                socket.emit('video-ended', { roomId });
                                            }}
                                            onReady={() => setIsProcessingStateChange(false)}
                                            onError={(error) => {
                                                console.error("Video player error:", error);
                                                setIsProcessingStateChange(false);
                                                setIsPlaying(false);
                                            }}

                                        />
                                        <VideoControls
                                            isPlaying={isPlaying}
                                            onPlayPause={handleVideoControls.onPlayPause}
                                            onSeek={handleVideoControls.onSeek}
                                            duration={duration}
                                            currentTime={playerRef.current?.getCurrentTime() || 0}
                                            volume={volume}
                                            onVolumeChange={setVolume}
                                            disabled={isBuffering || isProcessingStateChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <p className="text-white/60 text-lg font-semibold">No video playing</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Form */}
                        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10">
                            <VideoForm onVideoAdded={handleVideoAdded} />
                        </div>
                    </div>

                    {/* Sidebar - Updated Layout */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-[calc(100vh-8rem)]">
                        {/* Chat Section */}
                        <div className="h-[95%] bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                            <div className="h-full flex flex-col">
                                <ChatBox roomId={roomId} />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoomPage;
