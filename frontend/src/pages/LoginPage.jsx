import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoggingIn } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(formData)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-black">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                            WatchPartey
                        </h1>
                        <nav>
                            <ul className="flex space-x-6">
                                <li>
                                    <a href="/register" className="text-white/80 hover:text-teal-400 transition-colors">
                                        Sign up
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16">
                <div className="flex gap-12">
                    {/* Left Section - App Info */}
                    <div className="flex-1 text-white space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold">Watch Together, Have Fun Together!</h2>
                            <p className="text-lg text-white/70">
                                Join WatchPartey and experience synchronized video watching with your friends.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: "🎥", title: "Sync Watching", desc: "Watch videos in perfect sync" },
                                { icon: "💬", title: "Live Chat", desc: "Chat with your friends in real-time" },
                                { icon: "🥳", title: "Have Fun!", desc: "Have fun together!" },
                                { icon: "👥", title: "Private Rooms", desc: "Invite only who you want" }
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">{feature.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-white">{feature.title}</h3>
                                            <p className="text-sm text-white/60">{feature.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - Login Form */}
                    <div className="w-[400px]">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                                <p className="text-white/60">Sign in to continue watching</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                                                 text-white placeholder-white/40 focus:outline-none focus:ring-2 
                                                 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                                                     text-white placeholder-white/40 focus:outline-none focus:ring-2 
                                                     focus:ring-teal-500 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoggingIn ? "Signing in..." : "Sign in"}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-white/60">
                                Don't have an account?{" "}
                                <a href="/register" className="text-teal-400 hover:underline">
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
