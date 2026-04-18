import React, { useEffect, useRef, useState } from 'react';
import PageTransition from '../components/PageTransition';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Box, ShieldCheck, Users, Vote, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

// -----------------------------
// Interactive 3D Glass Card
// A stunning, highly responsive 2D alternative to heavy Three.js canvas
// -----------------------------
const GlassTiltCard = ({ name, role, image }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
            className="w-full max-w-[300px] sm:max-w-sm h-80 sm:h-96 rounded-3xl relative overflow-hidden group cursor-pointer border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto"
        >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

            {/* Backdrop Blur "Fluid Glass" simulation */}
            <div className="absolute inset-0 bg-[#ffffff10] backdrop-blur-xl z-0" />

            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-20 pointer-events-none pb-8 sm:pb-12" style={{ transform: "translateZ(50px)" }}>
                <div className="w-16 h-16 rounded-full bg-slate-200 mb-4 overflow-hidden border-2 border-white/20">
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{name}</h3>
                <p className="text-blue-400 font-medium tracking-widest uppercase text-xs sm:text-sm mt-1">{role}</p>
            </div>
        </motion.div>
    );
};

// -----------------------------
// Infinite Marquee Ribbon
// -----------------------------
const MarqueeRibbon = () => {
    return (
        <div className="w-full overflow-hidden bg-blue-600 border-y border-white/20 py-3 sm:py-4 transform -rotate-2 scale-[1.05] shadow-2xl z-30 relative">
            <motion.div
                animate={{ x: [0, -1035] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                className="flex whitespace-nowrap"
            >
                {/* Repeat text multiple times for infinite effect */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center text-white/90 font-black text-2xl sm:text-3xl tracking-widest uppercase mx-4 sm:mx-8">
                        <span>TRANSPARENCY</span>
                        <span className="mx-4 sm:mx-8 text-blue-300">•</span>
                        <span>SMART GOVERNANCE</span>
                        <span className="mx-4 sm:mx-8 text-blue-300">•</span>
                        <span>AI ASSISTANCE</span>
                        <span className="mx-4 sm:mx-8 text-blue-300">•</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const Home = () => {
    return (
        <PageTransition>
            <div className="relative bg-[#020617] w-full text-slate-100"> {/* Master Wrapper NO parent overflow-hidden to allow sticky */}

                {/* ============================== */}
                {/* SECTION 1: HERO */}
                {/* ============================== */}
                <div className="relative min-h-[100vh] w-full flex flex-col justify-center items-center bg-[#020617] border-b border-white/10 z-10 overflow-hidden shadow-2xl py-20">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617]"></div>

                    {/* Animated Blobs */}
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-20 sm:mt-12 lg:mt-0">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                            className="px-6 py-2 rounded-full bg-white/5 backdrop-blur-md text-blue-300 border border-blue-500/30 text-sm font-semibold tracking-wide mb-6 sm:mb-8 inline-block shadow-2xl"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2 animate-pulse"></span>
                            Digital India Starts at the Panchayat Level
                        </motion.span>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4 sm:mb-6 leading-tight tracking-tighter">
                            e-<span className="text-blue-500">PC</span>
                        </h1>
                        <h2 className="text-xl sm:text-2xl md:text-4xl text-gray-300 font-light mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                            The Next Generation <span className="font-semibold text-white"> e-Panchayat</span>
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
                            Empowering rural communities with transparent grievance redressal, intelligent AI assistance, and seamless voting structures.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
                            <Link to="/login" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold transition flex items-center justify-center gap-2 hover:bg-blue-500 shadow-xl w-full sm:w-auto">
                                Let's Start <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ============================== */}
                {/* SECTION 2: MARQUEE & AIM */}
                {/* ============================== */}
                <div className="relative min-h-[100vh] w-full bg-[#0a0a0a] z-20 flex flex-col pt-16 sm:pt-32 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t border-[rgba(255,255,255,0.05)]">

                    {/* Tightly wrap marquee x-overflow to not break sticky parent */}
                    <div className="w-full overflow-x-hidden mb-12 sm:mb-0 pb-10">
                        <MarqueeRibbon />
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 mt-4 sm:mt-12 pb-16 sm:pb-24">
                        <div className="text-center mb-10 sm:mb-16 max-w-4xl">
                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tighter">Our Core Aim</h2>
                            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light px-2">
                                To showcase to the judging panel a completely functional, highly secure, and extremely modern approach to digitizing village administration in India using real-world AI and mapping technologies.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-2">
                            <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-blue-500/50 transition duration-500 hover:-translate-y-2">
                                <Megaphone className="w-10 h-10 text-blue-500 mb-4 sm:mb-6" />
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">AI Complaints</h3>
                                <p className="text-slate-400 text-sm sm:text-base">Geo-tagged image uploads and AI-powered multi-lingual processing for transparent grievance handling.</p>
                            </div>
                            <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition duration-500 hover:-translate-y-2">
                                <Vote className="w-10 h-10 text-emerald-500 mb-4 sm:mb-6" />
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Digital Polling</h3>
                                <p className="text-slate-400 text-sm sm:text-base">Secure community voting directly from the dashboard for instant, verifiable local consensus.</p>
                            </div>
                            <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-purple-500/50 transition duration-500 hover:-translate-y-2">
                                <ShieldCheck className="w-10 h-10 text-purple-500 mb-4 sm:mb-6" />
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Scheme Integrations</h3>
                                <p className="text-slate-400 text-sm sm:text-base">Directly feeding live government schemes data to local residents in their native language.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================== */}
                {/* SECTION 3: TEAM */}
                {/* ============================== */}


                <div className="relative z-10 mt-16 sm:mt-24 text-slate-500 text-xs sm:text-sm text-center">
                    © 2026 e-PC | All Rights Reserved
                </div>
            </div>


        </PageTransition >
    );
};

export default Home;
