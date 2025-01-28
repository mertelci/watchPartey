const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-transparent to-black/40 backdrop-blur-md border-t border-white/10 mt-auto">
            <div className="container mx-auto px-6 py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                            WatchPartey
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Experience synchronized video watching with friends. Share moments, chat, and create memories together in real-time.
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                            <a href="https://github.com/mertelci"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <svg className="w-5 h-5 text-white/60 hover:text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
                                </svg>
                            </a>
                            <a href="https://linkedin.com/in/mertelci"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <svg className="w-5 h-5 text-white/60 hover:text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">Features</h4>
                        <ul className="space-y-2">
                            <li className="text-white/60 hover:text-teal-400 transition-colors text-sm">✨ Synchronized Playback</li>
                            <li className="text-white/60 hover:text-teal-400 transition-colors text-sm">💭 Real-time Chat</li>
                            <li className="text-white/60 hover:text-teal-400 transition-colors text-sm">🎮 Video Controls</li>
                            <li className="text-white/60 hover:text-teal-400 transition-colors text-sm">🔒 Private Rooms</li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">Contact</h4>
                        <p className="text-white/60 text-sm">Have questions or feedback? Reach out!</p>
                        <a
                            href="mailto:contact@watchpartey.com"
                            className="inline-flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors text-sm"
                        >
                            <span>📧</span>
                            <span>mertelci111@gmail.com</span>
                        </a>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="border-t border-white/10 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/40 text-sm">
                            © {new Date().getFullYear()} WatchPartey by Mert Elçi. All rights reserved.
                        </p>

                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;