import { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

const ChatBox = ({ roomId }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const { authUser } = useAuthStore();
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        socket.on('new-message', (messageData) => {
            setMessages(prev => [...prev, messageData]);
        });

        return () => {
            socket.off('new-message');
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        socket.emit('send-message', {
            roomId,
            message: message.trim()
        });

        setMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-gray-700">Chat</h3>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.username === authUser?.username ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex flex-col max-w-[75%] ${msg.username === authUser?.username ? 'items-end' : 'items-start'
                            }`}>
                            <span className="text-xs text-gray-500 mb-1 px-2 font-normal">
                                {msg.username}
                            </span>
                            <div className={`rounded-xl px-4 py-2 ${msg.username === authUser?.username
                                ? 'bg-teal-600 text-white ml-4'
                                : 'bg-teal-800 text-white ml-4'
                                }`}>
                                <p style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                                    className="text-sm whitespace-normal font-semibold">
                                    {msg.message}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 px-2">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="flex items-center space-x-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 input input-bordered bg-gray-50 focus:outline-none focus:border-teal-500"
                    />

                </form>
            </div>
        </div>
    );
};

export default ChatBox;