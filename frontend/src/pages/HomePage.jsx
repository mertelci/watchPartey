import React from "react";
import { useAuthStore } from "../store/authStore";
import RoomCreateForm from '../components/RoomCreateForm';
import RoomList from '../components/RoomList';

const HomePage = () => {
    const { logout, authUser } = useAuthStore();  // authUser'ı ekle

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-black">
            {/* Header with glass effect */}
            <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                            WatchPartey
                        </h1>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-300">{authUser?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500/10 text-white rounded-lg 
                                         hover:bg-red-900 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <RoomCreateForm />
                    </div>
                    <div className="lg:col-span-2">
                        <RoomList />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
