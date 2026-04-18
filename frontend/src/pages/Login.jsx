import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Shield } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Citizen' });
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`;
            const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
            
            const res = await axios.post(url, payload);
            login(res.data);
            toast.success(`${isLogin ? 'Welcome Back!' : 'Registration successful!'}`);
            navigate(res.data.role === 'Admin' ? '/admin' : '/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-900 overflow-y-auto overflow-x-hidden relative selection:bg-blue-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="w-[120vw] h-[120vw] lg:w-[80vw] lg:h-[80vw] bg-blue-600/10 rounded-full blur-[150px] absolute -left-1/4 -top-1/4"
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-[100vw] h-[100vw] lg:w-[60vw] lg:h-[60vw] bg-indigo-500/10 rounded-full blur-[120px] absolute -right-1/4 -bottom-1/4"
                />
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen relative z-10 pt-20 lg:pt-0">
                {/* Left Graphic Side (Hidden on mobile) */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16">
                    <div>
                        <Link to="/" className="flex items-center text-white/50 text-sm font-medium hover:text-white transition group w-fit">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>
                    <div className="mb-20">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-7xl font-extrabold text-white tracking-tighter leading-[0.9]"
                        >
                            {isLogin ? (
                                <>Welcome<br/><span className="text-blue-500">Back.</span></>
                            ) : (
                                <>Start<br/><span className="text-blue-500">Journey.</span></>
                            )}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400 mt-6 text-xl max-w-sm"
                        >
                            {isLogin ? "Access your digital panchayat dashboard to stay connected." : "Join the modern digital governance platform today."}
                        </motion.p>
                    </div>
                </div>

                {/* Right Form Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 mb-12 lg:mb-0">
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-[480px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
                        
                        <div className="lg:hidden mb-8 text-center pt-2">
                            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                                {isLogin ? 'Sign In' : 'Register'}
                            </h2>
                            <p className="text-slate-400 text-sm">{isLogin ? "Welcome back to e-PC" : "Create your e-PC account"}</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        className="space-y-5 sm:space-y-6 overflow-hidden"
                                    >
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition" />
                                            <input 
                                                type="text" required autoComplete="name" placeholder="Full Name"
                                                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition backdrop-blur-md text-sm sm:text-base"
                                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition" />
                                            <select 
                                                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#0f172a]/80 text-slate-300 border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition appearance-none backdrop-blur-md text-sm sm:text-base"
                                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                                            >
                                                <option value="Citizen" className="bg-slate-900 text-white">Citizen Role</option>
                                                <option value="Admin" className="bg-slate-900 text-white">Administrator Role</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition" />
                                <input 
                                    type="email" required autoComplete="username" placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition backdrop-blur-md text-sm sm:text-base"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition" />
                                <input 
                                    type="password" required autoComplete={isLogin ? "current-password" : "new-password"} placeholder="Password"
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition backdrop-blur-md text-sm sm:text-base"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                className="w-full py-3.5 sm:py-4 mt-6 sm:mt-8 bg-white text-slate-900 rounded-xl sm:rounded-2xl font-bold tracking-wide hover:bg-blue-50 transition shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] text-base"
                            >
                                {isLogin ? 'Continue to Dashboard' : 'Create Account'}
                            </motion.button>
                        </form>

                        <div className="mt-8 text-center border-t border-white/10 pt-6">
                            <button 
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-slate-400 hover:text-white text-sm font-medium transition"
                            >
                                {isLogin ? "New to e-PC? " : "Already registered? "}
                                <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-4">
                                    {isLogin ? "Create an account" : "Sign in here"}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
