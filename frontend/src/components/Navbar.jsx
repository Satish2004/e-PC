import React, { useState, useEffect } from 'react';
import { Bell, ArrowRight, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

// Animated Hamburger Menu Icon
const MenuToggle = ({ toggle, isOpen }) => (
    <button onClick={toggle} className="relative z-50 w-8 h-8 flex items-center justify-center focus:outline-none">
        <motion.div
            animate={isOpen ? "open" : "closed"}
            className="flex flex-col space-y-1.5 items-end"
        >
            <motion.span
                variants={{
                    closed: { rotate: 0, y: 0, width: 24, backgroundColor: "#fff" },
                    open: { rotate: 45, y: 8, width: 24, backgroundColor: "#fff" }
                }}
                className="h-[2px] block rounded-full transition-colors"
            />
            <motion.span
                variants={{
                    closed: { opacity: 1, width: 16, backgroundColor: "#fff" },
                    open: { opacity: 0, width: 16, backgroundColor: "#fff" }
                }}
                className="h-[2px] block rounded-full transition-colors"
            />
            <motion.span
                variants={{
                    closed: { rotate: 0, y: 0, width: 24, backgroundColor: "#fff" },
                    open: { rotate: -45, y: -8, width: 24, backgroundColor: "#fff" }
                }}
                className="h-[2px] block rounded-full transition-colors"
            />
        </motion.div>
    </button>
);

const Navbar = () => {
    const { user, token, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && token) {
            api.get('/notifications')
            .then(res => setNotifications(res.data))
            .catch(err => console.log(err));
        }
    }, [user, token]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    // Menu animation variants
    const menuVariants = {
        closed: { opacity: 0, y: "-100%", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
        open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        closed: { opacity: 0, y: 20 },
        open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <>
            {/* FLOATING PILL NAVBAR - Reduced max-w to bring items closer */}
            <motion.nav 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 w-[95%] md:w-auto md:min-w-[700px] bg-[#0a0a0a]/80 backdrop-blur-xl z-[9000] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full px-4 sm:px-6 py-2 flex items-center justify-between"
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-2 z-[60]">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
                    </div>
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:opacity-80 transition">
                        e-<span className="font-light">PC</span>
                    </Link>
                </div>

                {/* Center: Desktop Links */}
                <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Home</Link>
                    {user && (
                        <Link to={user.role === 'Admin' ? '/admin' : '/dashboard'} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="hidden md:flex items-center space-x-4 z-[60]">
                    {user ? (
                        <>
                            {/* Notification Bell */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="text-slate-400 hover:text-white transition-colors relative p-2"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-2 bg-blue-500 text-white text-[10px] w-2 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {showDropdown && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-6 w-80 bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 py-2 max-h-96 overflow-y-auto"
                                        >
                                            <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center">
                                                <h3 className="font-semibold text-white text-sm tracking-wide">Notifications</h3>
                                            </div>
                                            {notifications.length === 0 ? (
                                                <p className="px-5 py-6 text-sm text-slate-500 text-center font-light">No new notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div 
                                                        key={n._id} 
                                                        onClick={async () => {
                                                            if (!n.isRead) {
                                                                try {
                                                                    await api.put(`/notifications/${n._id}/read`);
                                                                    setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
                                                                } catch (error) {
                                                                    console.error(error);
                                                                }
                                                            }
                                                        }}
                                                        className={`px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-500/10 relative' : ''}`}
                                                    >
                                                        {/* Unread dot indicator inside the list */}
                                                        {!n.isRead && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
                                                        
                                                        <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-slate-200'}`}>{n.title}</p>
                                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={handleLogout} className="px-5 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-semibold">
                                Log out
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="px-5 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-semibold shadow-xl">
                            Sign up
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center z-[60]">
                    {user && (
                        <button 
                            onClick={() => navigate(user.role === 'Admin' ? '/admin' : '/dashboard')}
                            className="mr-2 text-slate-400 relative p-2"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && <span className="absolute top-1 right-2 bg-blue-500 w-2 h-2 rounded-full"></span>}
                        </button>
                    )}
                    <MenuToggle toggle={() => setIsOpen(!isOpen)} isOpen={isOpen} />
                </div>
            </motion.nav>

            {/* Mobile Menu Fullscreen Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed inset-0 w-full h-screen bg-[#020617]/95 backdrop-blur-3xl z-[8000] flex flex-col items-center justify-center space-y-8"
                    >
                        <motion.div variants={itemVariants}>
                            <Link to="/" onClick={() => setIsOpen(false)} className="text-4xl text-white font-bold hover:text-blue-400 transition-colors">
                                Home
                            </Link>
                        </motion.div>
                        
                        {user ? (
                            <>
                                <motion.div variants={itemVariants}>
                                    <Link to={user.role === 'Admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="text-4xl text-white font-bold hover:text-blue-400 transition-colors">
                                        Dashboard
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <button onClick={handleLogout} className="text-4xl text-white font-bold hover:text-red-400 transition-colors">
                                        Logout
                                    </button>
                                </motion.div>
                            </>
                        ) : (
                            <motion.div variants={itemVariants}>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="px-8 py-4 rounded-full bg-white text-black text-2xl font-bold flex items-center gap-3">
                                    Sign In <ArrowRight className="w-6 h-6"/>
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
